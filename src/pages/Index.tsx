
import { useOutletContext } from "react-router-dom";
import { IndexContent } from "@/components/home/IndexContent";
import { SEO } from "@/components/seo/SEO";
import { memo, useState, useEffect } from "react";
import { PasswordOverlay } from "@/components/home/PasswordOverlay";

interface IndexContext {
  searchQuery: string;
  selectedCategories: string[];
}

const Index = memo(function Index() {
  const { searchQuery, selectedCategories } = useOutletContext<IndexContext>();
  const [showPasswordOverlay, setShowPasswordOverlay] = useState(true);
  
  useEffect(() => {
    // Check if the password has been entered in this session
    const passwordEntered = sessionStorage.getItem('sitePasswordEntered');
    if (passwordEntered === 'true') {
      setShowPasswordOverlay(false);
    }
  }, []);
  
  const handlePasswordCorrect = () => {
    setShowPasswordOverlay(false);
  };
  
  return (
    <>
      <SEO
        title="Aktualności"
        description="Koła Młodych OZZ Inicjatywy Pracowniczej - najnowsze informacje i aktualności dotyczące działalności młodzieżowych struktur związku zawodowego."
        keywords="związek zawodowy, aktualności, młodzi pracownicy, inicjatywa pracownicza"
      />
      
      {showPasswordOverlay && (
        <PasswordOverlay 
          correctPassword="testing090920" 
          onPasswordCorrect={handlePasswordCorrect} 
        />
      )}
      
      <div className={`animate-enter ${showPasswordOverlay ? 'hidden' : 'block'}`}>
        <IndexContent searchQuery={searchQuery} selectedCategories={selectedCategories} />
      </div>
    </>
  );
});

export default Index;
