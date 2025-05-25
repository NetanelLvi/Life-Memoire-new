
import React from 'react';
import { Upload, Wand2, BookOpen, Image } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }: { 
  icon: React.ElementType, 
  title: string, 
  description: string,
  delay: string 
}) => {
  return (
    <div className={`glass-card animate-fade-in-up`} style={{ animationDelay: delay }}>
      <div className="flex flex-col items-center text-center">
        <div className="bg-memoir-yellow p-3 rounded-full mb-4">
          <Icon size={28} className="text-memoir-darkGray" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-memoir-darkGray">{title}</h3>
        <p className="text-memoir-darkGray">{description}</p>
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-memoir-darkGray">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={Upload}
            title="Upload Content"
            description="Easily upload your stories, photos, and memories in any format."
            delay="0s"
          />
          
          <FeatureCard 
            icon={Wand2}
            title="Organize & Articulate Fluently"
            description="Our platform helps organize your content and refines your narrative."
            delay="0.2s"
          />
          
          <FeatureCard 
            icon={Image}
            title="Generate Photos"
            description="Generate photos for your book or even of your loved ones using old photos."
            delay="0.4s"
          />
          
          <FeatureCard 
            icon={BookOpen}
            title="Produce Your Book"
            description="Export a professional-quality book ready for printing or digital sharing."
            delay="0.6s"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
