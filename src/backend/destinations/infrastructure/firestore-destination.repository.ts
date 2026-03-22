import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { Destination } from '../domain/destination.model';

export class FirestoreDestinationRepository {
  private db = getFirestore();
  private collection = this.db.collection('destinations');

  private getFilePathFromUrl(url: string): string | null {
    try {
      const urlObject = new URL(url);
      const pathSegments = urlObject.pathname.split('/');
      const objectPath = pathSegments.slice(pathSegments.indexOf('o') + 1).join('/');
      return decodeURIComponent(objectPath);
    } catch (error) {
      console.error(`Invalid URL provided, cannot extract file path: ${url}`, error);
      return null;
    }
  }

  generateId(): string {
    return this.collection.doc().id;
  }

  async findById(id: string): Promise<Destination | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as Destination;
  }

  async findBySlug(slug: string, lang: string): Promise<Destination | null> {
    const snapshot = await this.collection.where(`slug.${lang}`, '==', slug).limit(1).get();
    if (snapshot.empty) {
        return null;
    }
    return snapshot.docs[0].data() as Destination;
  }

  async findAll(): Promise<Destination[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => doc.data() as Destination);
  }

  async save(destination: Destination): Promise<void> {
    await this.collection.doc(destination.id).set(destination);
  }

  async update(destination: Partial<Destination> & { id: string }): Promise<void> {
    const { id, ...destData } = destination;
    await this.collection.doc(id).update(destData);
  }

  async delete(id: string): Promise<void> {
    const dest = await this.findById(id);
    if (!dest) {
        throw new Error(`Destination with id ${id} not found.`);
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      throw new Error('Firebase Storage bucket name is not configured in environment variables.');
    }
    const storage = getStorage();
    const bucket = storage.bucket(bucketName);

    const imageDeletionPromises: Promise<any>[] = [];
    const imageUrls = [dest.mainImage, ...(dest.galleryImages || [])];
    
    for (const url of imageUrls) {
        if (url) {
            const filePath = this.getFilePathFromUrl(url);
            if (filePath) {
                const file = bucket.file(filePath);
                imageDeletionPromises.push(file.delete().catch(err => console.error(`Failed to delete image ${filePath}:`, err)));
            }
        }
    }
    
    await Promise.all(imageDeletionPromises);
    await this.collection.doc(id).delete();
  }
}
