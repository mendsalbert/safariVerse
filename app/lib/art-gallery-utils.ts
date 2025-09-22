/**
 * Utility functions for art gallery AWS S3 integration
 */

const AWS_S3_BASE_URL =
  "https://hedera-nft-gld.s3.us-east-1.amazonaws.com/artgallery";

/**
 * Creates a proxied URL for AWS S3 GLB files
 * @param filename - The GLB filename (e.g., "Elephant+.glb")
 * @returns Proxied URL that can be used with useGLTF
 */
export function createArtGalleryGLBUrl(filename: string): string {
  const s3Url = `${AWS_S3_BASE_URL}/${filename}`;
  return `/api/glb?url=${encodeURIComponent(s3Url)}`;
}

/**
 * Art gallery items configuration
 */
export interface ArtGalleryItem {
  type: "model";
  src: string;
  title: string;
}

/**
 * Predefined art gallery items with AWS S3 URLs
 */
export const ART_GALLERY_ITEMS: ArtGalleryItem[] = [
  {
    type: "model",
    src: createArtGalleryGLBUrl("Elephant+.glb"),
    title: "Elephant Sculpture",
  },
  //   {
  //     type: "model",
  //     src: createArtGalleryGLBUrl("2000's radio.glb"),
  //     title: "2000's Radio",
  //   },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Salt+lamp.glb"),
    title: "Salt Lamp",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("African+Chair.glb"),
    title: "African Chair",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("3+leg+potjie+pot.glb"),
    title: "3-Leg Potjie Pot",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Woodstock+2_.glb"),
    title: "Woodstock 2",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Giraffe+(1).glb"),
    title: "Giraffe",
  },
  //   {
  //     type: "model",
  //     src: createArtGalleryGLBUrl("An+old+South+African+springbok+coin.glb"),
  //     title: "Springbok Coin",
  //   },
  {
    type: "model",
    src: createArtGalleryGLBUrl("African+sculpture+.glb"),
    title: "African Sculpture",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Ndebele+doll+2.glb"),
    title: "Ndebele Doll",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Safari+Car.glb"),
    title: "Safari Car",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Guro+Mask++(1).glb"),
    title: "Guro Mask",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("African+Drum+(1).glb"),
    title: "African Drum",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("African+Bowl.glb"),
    title: "African Bowl",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Olympic+Africa%2C+by+Tim+Holmes.glb"),
    title: "Olympic Africa",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("African+Water.glb"),
    title: "African Water",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Wooden+sculpture%2C+African+woman.glb"),
    title: "Wooden Sculpture",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("African+Chair+(1).glb"),
    title: "African Chair (Variant)",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Yoruba+Fetish+Figure%2C+Africa.glb"),
    title: "Yoruba Fetish Figure",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Statue+africaine+1.glb"),
    title: "Statue Africaine",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("African+American+designer+backpack+.glb"),
    title: "African Designer Backpack",
  },
  {
    type: "model",
    src: createArtGalleryGLBUrl("Chokwe+Helmet+Mask.glb"),
    title: "Chokwe Helmet Mask",
  },
];
