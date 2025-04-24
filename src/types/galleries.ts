
export interface Gallery {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  gallery_images: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  gallery_id: string;
  url: string;
  caption: string | null;
  position: number;
  created_at: string;
}

export interface GalleryFormData {
  title: string;
  description?: string;
}
