
// Mock data for portfolio items
const portfolioItems = [
  {
    id: 1,
    title: "A Lifetime of Adventures",
    excerpt: "From climbing mountains in my youth to building a family legacy...",
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Wartime Memories",
    excerpt: "The stories of courage and resilience during the most challenging times...",
    image: "https://images.unsplash.com/photo-1533293962331-eb1c8020963a?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Family Treasures",
    excerpt: "The recipes, traditions, and wisdom passed down through generations...",
    image: "https://images.unsplash.com/photo-1530021232320-687d8e3dba54?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Immigrant's Journey",
    excerpt: "The path from my homeland to a new beginning across the ocean...",
    image: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?q=80&w=500&auto=format&fit=crop"
  }
];

const PortfolioSection = () => {
  return (
    <section id="portfolio" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-memoir-darkGray">
          Stories Already Told
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolioItems.map((item) => (
            <div 
              key={item.id} 
              className="glass-card transform hover:translate-y-[-5px] hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-memoir-darkGray">{item.title}</h3>
                <p className="text-sm text-memoir-darkGray">{item.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
