# Art Gallery AWS S3 Optimization

## Overview

The art gallery has been optimized to load GLB files from AWS S3 instead of local files for significantly faster loading times and better performance.

## Implementation Details

### 1. AWS S3 Integration

- **Base URL**: `https://hedera-nft-gld.s3.us-east-1.amazonaws.com/artgallery/`
- **Proxy Endpoint**: `/api/glb` (reuses existing NFT infrastructure)
- **Benefits**:
  - Faster loading from CDN
  - Reduced server load
  - Better caching
  - Improved user experience

### 2. Files Modified

- `app/artgallery/[countryId]/page.tsx` - Updated to use AWS S3 URLs
- `app/lib/art-gallery-utils.ts` - New utility file for managing art gallery items

### 3. Available Art Gallery Items

The following 22 art gallery items are now loaded from AWS S3:

1. Elephant Sculpture
2. 2000's Radio
3. Salt Lamp
4. African Chair
5. 3-Leg Potjie Pot
6. Woodstock 2
7. Giraffe
8. Springbok Coin
9. African Sculpture
10. Ndebele Doll
11. Safari Car
12. Guro Mask
13. African Drum
14. African Bowl
15. Olympic Africa
16. African Water
17. Wooden Sculpture
18. African Chair (Variant)
19. Yoruba Fetish Figure
20. Statue Africaine
21. African Designer Backpack
22. Chokwe Helmet Mask

### 4. Technical Implementation

#### URL Generation

```typescript
function createArtGalleryGLBUrl(filename: string): string {
  const s3Url = `${AWS_S3_BASE_URL}/${filename}`;
  return `/api/glb?url=${encodeURIComponent(s3Url)}`;
}
```

#### Preloading

All models are preloaded in the background using `useGLTF.preload()` for optimal performance.

#### Error Handling

- Graceful fallback if models fail to load
- Console warnings for debugging
- Non-blocking preload failures

### 5. Performance Benefits

- **Faster Loading**: AWS S3 CDN provides faster download speeds
- **Reduced Server Load**: Files served directly from S3
- **Better Caching**: S3 provides better caching headers
- **Scalability**: Can handle more concurrent users
- **Reliability**: AWS S3's high availability

### 6. Usage

The art gallery automatically uses the optimized AWS S3 URLs. No additional configuration is required.

### 7. Adding New Items

To add new art gallery items:

1. Upload the GLB file to the S3 bucket
2. Add the item to `ART_GALLERY_ITEMS` in `app/lib/art-gallery-utils.ts`
3. The system will automatically handle URL generation and preloading

## Testing

The implementation has been tested and verified:

- ✅ AWS S3 URLs are accessible
- ✅ Proxy endpoint works correctly
- ✅ GLB files load properly
- ✅ No linting errors
- ✅ Type safety maintained
