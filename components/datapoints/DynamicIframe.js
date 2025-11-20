import React, { useEffect, useRef } from 'react';  

export default function DynamicIframe({ src, title }) {  
  const iframeRef = useRef(null);  

  useEffect(() => {  
    const iframe = iframeRef.current;  
    
    const handleLoad = () => {  
      console.log('Iframe loaded successfully');  
    };  

    iframe.addEventListener('load', handleLoad);  

    return () => {  
      iframe.removeEventListener('load', handleLoad);  
    };  
  }, []);  

  return (  
    <iframe   
      ref={iframeRef}  
      src={src}  
      width="100%"   
      height="100%"   
      frameBorder="0"  
      allowFullScreen  
      title={title}  
      className="w-full h-full"  
    />  
  );  
}  