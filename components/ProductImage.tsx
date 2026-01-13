// components/ProductImage.tsx
"use client"

import { useState, useEffect } from 'react'

interface ProductImageProps {
  thumbnail?: string | null
  productName: string
  className?: string
  showProductName?: boolean
}

export default function ProductImage({ 
  thumbnail, 
  productName, 
  className = "",
  showProductName = false
}: ProductImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const getProductImageUrl = (thumb?: string | null): string | null => {
      if (!thumb || 
          thumb === "string" || 
          thumb.trim() === "" || 
          thumb === "null" || 
          thumb === "undefined") {
        return null;
      }
      
      // If it's a via.placeholder.com URL that's failing, replace with a working alternative
      if (thumb.includes('via.placeholder.com')) {
        // Extract dimensions and text from the original URL
        const match = thumb.match(/(\d+)x(\d+).*?text=([^&]*)/);
        if (match) {
          const [, width, height, text] = match;
          // Use a more reliable placeholder service
          return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;
        }
        // Fallback to a standard size
        return `https://picsum.photos/640/480?random=${Math.floor(Math.random() * 1000)}`;
      }
      
      if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
        return thumb;
      }
      
      if (thumb.startsWith('data:image/')) {
        return thumb;
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(thumb)) {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/images/${thumb}`;
      }
      
      if (thumb.includes('.') && (thumb.includes('.jpg') || thumb.includes('.jpeg') || thumb.includes('.png') || thumb.includes('.webp'))) {
        return `/images/${thumb}`;
      }
      
      if (thumb.length > 0 && !thumb.includes('/')) {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/images/${thumb}`;
      }
      
      return null;
    };

    const validUrl = getProductImageUrl(thumbnail);
    setImageSrc(validUrl);
    setImageState(validUrl ? 'loading' : 'error');
    setRetryCount(0);
  }, [thumbnail]);

  const handleImageLoad = () => {
    setImageState('loaded');
  };

  const handleImageError = () => {
    console.warn(`Failed to load image for product: ${productName}`, { thumbnail, imageSrc, retryCount });
    
    // Try alternative placeholder services on error
    if (retryCount < 2 && imageSrc) {
      setRetryCount(prev => prev + 1);
      
      if (retryCount === 0) {
        // First retry: Try Lorem Picsum
        setImageSrc(`https://picsum.photos/640/480?random=${Date.now()}`);
        setImageState('loading');
        return;
      } else if (retryCount === 1) {
        // Second retry: Try a different service
        setImageSrc(`https://source.unsplash.com/640x480/?product,${encodeURIComponent(productName.split(' ')[0])}`);
        setImageState('loading');
        return;
      }
    }
    
    setImageState('error');
  };

  // Generate a nice placeholder with product initial
  const getProductInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Generate a color based on product name
  const getProductColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Placeholder component
  const PlaceholderImage = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="text-center p-4">
        <div className={`w-16 h-16 rounded-full ${getProductColor(productName)} flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold`}>
          {getProductInitial(productName)}
        </div>
        <p className="text-xs text-gray-500 font-medium">No Image Available</p>
        {showProductName && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{productName}</p>
        )}
      </div>
    </div>
  );

  if (imageState === 'error' || !imageSrc) {
    return <PlaceholderImage />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-2"></div>
            <p className="text-xs text-gray-500">Loading image...</p>
            {retryCount > 0 && (
              <p className="text-xs text-gray-400">Retry {retryCount}/2</p>
            )}
          </div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={productName}
        className={`w-full h-full object-cover transition-all duration-300 ${
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
}