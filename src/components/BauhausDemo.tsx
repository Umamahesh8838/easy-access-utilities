
import { BauhausCard } from "@/components/ui/bauhaus-card";

const BauhausDemo = () => {
  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Featured Tool Cards</h2>
          <p className="text-muted-foreground text-lg">Interactive cards showcasing our most popular tools</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {/* File Download Card */}
          <BauhausCard
            id="1"
            accentColor="#156ef6"
            backgroundColor="var(--bauhaus-card-bg)"
            separatorColor="var(--bauhaus-card-separator)"
            borderRadius="2em"
            borderWidth="2px"
            topInscription="Uploaded on 12/31/2024"
            mainText="Image Converter"
            subMainText="Converting file..."
            progressBarInscription="Progress:"
            progress={75.98}
            progressValue="75.98%"
            filledButtonInscription="Download"
            outlinedButtonInscription="Share"
            onFilledButtonClick={id => console.log(`Download clicked for ID: ${id}`)}
            onOutlinedButtonClick={id => console.log(`Share clicked for ID: ${id}`)}
            onMoreOptionsClick={id => console.log(`More options clicked for ID: ${id}`)}
            mirrored={false}
            swapButtons={false}
            textColorTop="var(--bauhaus-card-inscription-top)"
            textColorMain="var(--bauhaus-card-inscription-main)"
            textColorSub="var(--bauhaus-card-inscription-sub)"
            textColorProgressLabel="var(--bauhaus-card-inscription-progress-label)"
            textColorProgressValue="var(--bauhaus-card-inscription-progress-value)"
            progressBarBackground="var(--bauhaus-card-progress-bar-bg)"
            chronicleButtonBg="var(--bauhaus-chronicle-bg)"
            chronicleButtonFg="var(--bauhaus-chronicle-fg)"
            chronicleButtonHoverFg="var(--bauhaus-chronicle-hover-fg)"
          />

          {/* Course Card */}
          <BauhausCard
            id="2"
            accentColor="#24d200"
            backgroundColor="var(--bauhaus-card-bg)"
            separatorColor="var(--bauhaus-card-separator)"
            borderRadius="2em"
            borderWidth="2px"
            topInscription="Free Tool"
            mainText="CSS Generator"
            subMainText="Create beautiful CSS effects"
            progressBarInscription="Usage today:"
            progress={85}
            progressValue="850/1000"
            filledButtonInscription="Use Tool"
            outlinedButtonInscription="Bookmark"
            onFilledButtonClick={id => console.log(`Use tool clicked for ID: ${id}`)}
            onOutlinedButtonClick={id => console.log(`Bookmark clicked for ID: ${id}`)}
            onMoreOptionsClick={id => console.log(`More options clicked for ID: ${id}`)}
            mirrored={false}
            swapButtons={false}
            textColorTop="var(--bauhaus-card-inscription-top)"
            textColorMain="var(--bauhaus-card-inscription-main)"
            textColorSub="var(--bauhaus-card-inscription-sub)"
            textColorProgressLabel="var(--bauhaus-card-inscription-progress-label)"
            textColorProgressValue="var(--bauhaus-card-inscription-progress-value)"
            progressBarBackground="var(--bauhaus-card-progress-bar-bg)"
            chronicleButtonBg="var(--bauhaus-chronicle-bg)"
            chronicleButtonFg="var(--bauhaus-chronicle-fg)"
            chronicleButtonHoverFg="#151419"
          />

          {/* Text Tools Card */}
          <BauhausCard
            id="3"
            accentColor="#fc6800"
            backgroundColor="var(--bauhaus-card-bg)"
            separatorColor="var(--bauhaus-card-separator)"
            borderRadius="2.25em"
            borderWidth="3px"
            topInscription="Popular Tool"
            mainText="Text Converter"
            subMainText="Transform your text instantly"
            progressBarInscription="Available formats:"
            progress={95}
            progressValue="15+ formats"
            filledButtonInscription="Convert"
            outlinedButtonInscription="Examples"
            onFilledButtonClick={id => console.log(`Convert clicked for ID: ${id}`)}
            onOutlinedButtonClick={id => console.log(`Examples clicked for ID: ${id}`)}
            onMoreOptionsClick={id => console.log(`More options clicked for ID: ${id}`)}
            mirrored={false}
            swapButtons={false}
            textColorTop="var(--bauhaus-card-inscription-top)"
            textColorMain="var(--bauhaus-card-inscription-main)"
            textColorSub="var(--bauhaus-card-inscription-sub)"
            textColorProgressLabel="var(--bauhaus-card-inscription-progress-label)"
            textColorProgressValue="var(--bauhaus-card-inscription-progress-value)"
            progressBarBackground="var(--bauhaus-card-progress-bar-bg)"
            chronicleButtonBg="var(--bauhaus-chronicle-bg)"
            chronicleButtonFg="var(--bauhaus-chronicle-fg)"
            chronicleButtonHoverFg="var(--bauhaus-chronicle-hover-fg)"
          />

          {/* QR Code Generator Card */}
          <BauhausCard
            id="4"
            accentColor="#8f10f6"
            backgroundColor="var(--bauhaus-card-bg)"
            separatorColor="var(--bauhaus-card-separator)"
            borderRadius="1em"
            borderWidth="4px"
            topInscription="Quick & Easy"
            mainText="QR Generator"
            subMainText="Create QR codes instantly"
            progressBarInscription="Generated today:"
            progress={65}
            progressValue="2,500 codes"
            filledButtonInscription="Generate"
            outlinedButtonInscription="Templates"
            onFilledButtonClick={id => console.log(`Generate clicked for ID: ${id}`)}
            onOutlinedButtonClick={id => console.log(`Templates clicked for ID: ${id}`)}
            onMoreOptionsClick={id => console.log(`More options clicked for ID: ${id}`)}
            mirrored={false}
            swapButtons={false}
            textColorTop="var(--bauhaus-card-inscription-top)"
            textColorMain="var(--bauhaus-card-inscription-main)"
            textColorSub="var(--bauhaus-card-inscription-sub)"
            textColorProgressLabel="var(--bauhaus-card-inscription-progress-label)"
            textColorProgressValue="var(--bauhaus-card-inscription-progress-value)"
            progressBarBackground="var(--bauhaus-card-progress-bar-bg)"
            chronicleButtonBg="var(--bauhaus-chronicle-bg)"
            chronicleButtonFg="var(--bauhaus-chronicle-fg)"
            chronicleButtonHoverFg="var(--bauhaus-chronicle-hover-fg)"
          />
        </div>
      </div>
    </section>
  );
};

export default BauhausDemo;
