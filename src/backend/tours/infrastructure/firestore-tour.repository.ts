
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { Tour } from '../domain/tour.model';
import { TourRepository } from '../domain/tour.repository';

export class FirestoreTourRepository implements TourRepository {
  private db = getFirestore();
  private collection = this.db.collection('tours');

  private getFilePathFromUrl(url: string): string | null {
    try {
      const urlObject = new URL(url);
      const pathSegments = urlObject.pathname.split('/');
      // The actual path inside the bucket starts after the '/o/' segment
      const objectPath = pathSegments.slice(pathSegments.indexOf('o') + 1).join('/');
      return decodeURIComponent(objectPath);
    } catch (error) {
      console.error(`Invalid URL provided, cannot extract file path: ${url}`, error);
      return null;
    }
  }

  async findById(id: string): Promise<Tour | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as Tour;
  }

  async findBySlug(slug: string, lang: string): Promise<Tour | null> {
    const snapshot = await this.collection.where(`slug.${lang}`, '==', slug).limit(1).get();
    if (snapshot.empty) {
        return null;
    }
    return snapshot.docs[0].data() as Tour;
  }

  async findAll(): Promise<Tour[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => doc.data() as Tour);
  }

  async save(tour: Tour): Promise<void> {
    await this.collection.doc(tour.id).set(tour);
  }

  async update(tour: Partial<Tour> & { id: string }): Promise<void> {
    const { id, ...tourData } = tour;
     if (tourData.galleryImages && Array.isArray(tourData.galleryImages)) {
        await this.collection.doc(id).update({
            ...tourData,
            galleryImages: FieldValue.arrayUnion(...tourData.galleryImages as any)
        });
    } else {
        await this.collection.doc(id).update(tourData);
    }
  }

  async delete(id: string): Promise<void> {
    const tour = await this.findById(id);
    if (!tour) {
        throw new Error(`Tour with id ${id} not found.`);
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      throw new Error('Firebase Storage bucket name is not configured in environment variables.');
    }
    const storage = getStorage();
    const bucket = storage.bucket(bucketName);

    const imageDeletionPromises: Promise<any>[] = [];
    const imageUrls = [tour.mainImage, ...tour.galleryImages];
    
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

    