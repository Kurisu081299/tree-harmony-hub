
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, ChevronRight, Music, Users, FileText, Home, ExternalLink } from "lucide-react";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [lineupData, setLineupData] = useState([]);
  const [workersData1, setWorkersData1] = useState([]);
  const [workersData2, setWorkersData2] = useState([]);
  const [latestDate, setLatestDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Google Sheets configuration
  const sheetId = "1Rf7EGqVDLHieTWQC4iqnSox1wEUZtLAqvXm6b5g4tMg";
  const lineupSheetName = "Lineup Songs";
  const workersSheetName = "Workers";
  const apiKey = "AIzaSyA3G6VhZdf_0heYvIQr84u8HCerrrvsFUo";
  const pdfSrc = "https://drive.google.com/file/d/1V671ZKsWTom_5BxeEk7TFIKQKW9_WvKA/preview";

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = document.querySelectorAll('section[id]');
      let currentSection = 'home';
      
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < 100) {
          currentSection = section.id;
        }
      });
      
      setActiveSection(currentSection);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch data from Google Sheets
  useEffect(() => {
    const fetchSheetData = async () => {
      setIsLoading(true);
      const lineupUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${lineupSheetName}!B:E?key=${apiKey}`;
      const workersUrl1 = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${workersSheetName}!B:D?key=${apiKey}`;
      const workersUrl2 = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${workersSheetName}!F:H?key=${apiKey}`;

      try {
        const [lineupResponse, workersResponse1, workersResponse2] = await Promise.all([
          fetch(lineupUrl),
          fetch(workersUrl1),
          fetch(workersUrl2)
        ]);

        if (!lineupResponse.ok || !workersResponse1.ok || !workersResponse2.ok) {
          throw new Error("Failed to fetch data from Google Sheets");
        }

        const lineupData = await lineupResponse.json();
        const workersData1 = await workersResponse1.json();
        const workersData2 = await workersResponse2.json();

        // Find latest date from lineup data
        let latest = '';
        if (lineupData.values && lineupData.values.length > 1) {
          for (let i = 1; i < lineupData.values.length; i++) {
            if (lineupData.values[i] && lineupData.values[i][0] && (!latest || lineupData.values[i][0] > latest)) {
              latest = lineupData.values[i][0];
            }
          }
        }

        setLatestDate(latest);
        setLineupData(lineupData.values || []);
        setWorkersData1(workersData1.values || []);
        setWorkersData2(workersData2.values || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  // Update PDF viewer
  useEffect(() => {
    const pdfViewer = document.getElementById("pdfViewer");
    if (pdfViewer instanceof HTMLIFrameElement) {
      pdfViewer.src = pdfSrc;
    }
  }, []);

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'songs', label: 'Songs', icon: <Music size={18} /> },
    { id: 'team', label: 'Team', icon: <Users size={18} /> },
    { id: 'resources', label: 'Resources', icon: <FileText size={18} /> }
  ];

  // Scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // Render lineup card
  const renderLineupCard = (song, index) => {
    if (!song || song.length < 3) return null;
    
    const [date, songTitle, artist, keyInfo] = song;
    
    return (
      <div 
        key={`${songTitle}-${index}`}
        className="bg-white rounded-lg shadow-md p-4 mb-4 fade-up hover:shadow-lg transition-all duration-300"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-goodtree">{songTitle || 'Untitled'}</h3>
            <p className="text-gray-600">{artist || 'Unknown Artist'}</p>
            {keyInfo && <p className="text-sm text-gray-500 mt-1">Key: {keyInfo}</p>}
          </div>
          <span className="bg-goodtree-lighter text-goodtree text-sm px-3 py-1 rounded-full">
            {date || 'No Date'}
          </span>
        </div>
      </div>
    );
  };

  // Render latest lineup table
  const renderLatestLineupTable = () => {
    // Filter songs for the latest date
    const latestSongs = lineupData.filter(row => row && row[0] === latestDate);
    
    if (isLoading) {
      return (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      );
    }
    
    if (latestSongs.length === 0) {
      return <div className="text-center text-gray-500">No songs available</div>;
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-goodtree text-white">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Song Lineup</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Youtube Link</th>
            </tr>
          </thead>
          <tbody>
            {latestSongs.map((song, index) => {
              if (!song || song.length < 2) return null;
              
              const [date, songTitle, description, youtubeLink] = song;
              
              return (
                <tr key={`latest-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-4">{index === 0 ? date : ''}</td>
                  <td className="py-3 px-4 font-medium">{songTitle || '-'}</td>
                  <td className="py-3 px-4">{description || '-'}</td>
                  <td className="py-3 px-4">
                    {youtubeLink ? (
                      <a 
                        href={youtubeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-goodtree hover:underline flex items-center"
                      >
                        Watch/Listen <ExternalLink size={14} className="ml-1" />
                      </a>
                    ) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Render worker table rows
  const renderWorkerRows = (data) => {
    if (!data || data.length < 2) return null;
    
    return data.slice(1).map((row, index) => {
      if (!row || row.length < 2) return null;
      
      const [date, role, name] = row;
      
      return (
        <tr key={`worker-${index}`} className={index % 2 === 0 ? 'bg-goodtree-lighter/50' : 'bg-white'}>
          <td className="p-2">{date || '-'}</td>
          <td className="p-2">{role || '-'}</td>
          <td className="p-2 font-medium">{name || '-'}</td>
        </tr>
      );
    });
  };

  // Get team names from sheet data
  const getTeamName = (data, defaultName) => {
    if (data && data.length > 0 && data[0] && data[0][0]) {
      return data[0][0];
    }
    return defaultName;
  };

  const musicTeamName = getTeamName(workersData1, "Music Team");
  const productionTeamName = getTeamName(workersData2, "Production Team");

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <a href="#" className="flex items-center space-x-2" onClick={() => scrollToSection('home')}>
              <img 
                src="/lovable-uploads/11ec3d18-cf25-4232-b280-5199f06af73b.png" 
                alt="Good Tree Church Logo" 
                className="h-10 w-10" 
              />
              <div className={`font-semibold text-goodtree transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
                Good Tree Worship
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-goodtree ${activeSection === item.id ? 'text-goodtree' : 'text-gray-600'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-700 hover:text-goodtree"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 pb-6 px-4 md:hidden slide-in">
          <div className="flex flex-col space-y-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center space-x-3 py-3 px-4 rounded-lg ${activeSection === item.id ? 'bg-goodtree-lighter text-goodtree' : 'text-gray-700'}`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                <ChevronRight size={18} className="ml-auto" />
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="pt-20">
        {/* Hero Section */}
        <section id="home" className="py-12 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 fade-up">
                <div className="bg-goodtree-lighter/30 inline-block px-3 py-1 rounded-full text-goodtree text-sm font-medium mb-4">
                  Worship Ministry
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Good Tree Church <br />
                  <span className="text-goodtree">Worship Team</span>
                </h1>
                <p className="text-gray-600 mb-6 max-w-md">
                  Serving the church through music and creating a space for 
                  authentic worship experiences.
                </p>
                <div className="flex space-x-4">
                  <button 
                    className="bg-goodtree hover:bg-goodtree-light text-white px-6 py-3 rounded-lg shadow-hover transition-all duration-300"
                    onClick={() => scrollToSection('songs')}
                  >
                    View Lineup
                  </button>
                  <button 
                    className="border border-goodtree text-goodtree hover:bg-goodtree-lighter px-6 py-3 rounded-lg shadow-hover transition-all duration-300"
                    onClick={() => scrollToSection('resources')}
                  >
                    Resources
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 fade-up" style={{ animationDelay: '0.2s' }}>
                <img 
                  src="/lovable-uploads/6df505df-aaef-4505-87ea-102774592543.png" 
                  alt="Good Tree Worship Ministry" 
                  className="rounded-xl shadow-lg" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Latest Lineup Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-8 fade-up">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Latest Lineup{latestDate ? `: ${latestDate}` : ''}
              </h2>
              <div className="w-20 h-1 bg-goodtree mx-auto mt-2 mb-4"></div>
            </div>
            <div className="fade-up" style={{ animationDelay: '0.2s' }}>
              {renderLatestLineupTable()}
            </div>
          </div>
        </section>

        {/* Songs Section */}
        <section id="songs" className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-start">
              <div className="md:w-1/3 mb-8 md:mb-0 fade-up sticky top-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Song Lineup</h2>
                <p className="text-gray-600 mb-6">
                  Our worship team's song selection, updated directly from our planning sheets.
                </p>
                <div className="bg-goodtree text-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">About Our Music</h3>
                  <p className="text-sm">
                    We carefully select songs that are theologically sound, easy to sing along with, 
                    and that create an atmosphere of worship and reflection.
                  </p>
                </div>
              </div>
              <div className="md:w-2/3 md:pl-8 fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="space-y-4">
                  {isLoading ? (
                    <>
                      <div className="bg-white rounded-lg shadow-md p-4 mb-4 animate-pulse">
                        <div className="flex justify-between">
                          <div>
                            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-32"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow-md p-4 mb-4 animate-pulse">
                        <div className="flex justify-between">
                          <div>
                            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-32"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow-md p-4 mb-4 animate-pulse">
                        <div className="flex justify-between">
                          <div>
                            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-32"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </>
                  ) : lineupData.length > 1 ? (
                    lineupData.slice(1).map((song, index) => renderLineupCard(song, index))
                  ) : (
                    <div className="text-center text-gray-500 p-8">No songs available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10 fade-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Worship Team</h2>
              <div className="w-20 h-1 bg-goodtree mx-auto mt-2 mb-4"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Meet the dedicated individuals who serve in our worship ministry. 
                This schedule is updated automatically from our planning sheets.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto fade-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <h3 className="text-xl font-semibold text-goodtree mb-4">{musicTeamName}</h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-goodtree-lighter">
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Role</th>
                        <th className="p-2 text-left">Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <>
                          <tr className="animate-pulse">
                            <td className="p-2"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                            <td className="p-2"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                            <td className="p-2"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                          </tr>
                          <tr className="bg-gray-50 animate-pulse">
                            <td className="p-2"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="p-2"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                            <td className="p-2"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          </tr>
                        </>
                      ) : workersData1.length > 1 ? (
                        renderWorkerRows(workersData1)
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-gray-500">No team data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-goodtree mb-4">{productionTeamName}</h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-goodtree-lighter">
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Role</th>
                        <th className="p-2 text-left">Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <>
                          <tr className="animate-pulse">
                            <td className="p-2"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                            <td className="p-2"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                            <td className="p-2"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                          </tr>
                          <tr className="bg-gray-50 animate-pulse">
                            <td className="p-2"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="p-2"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                            <td className="p-2"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          </tr>
                        </>
                      ) : workersData2.length > 1 ? (
                        renderWorkerRows(workersData2)
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-gray-500">No team data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section id="resources" className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-start">
              <div className="md:w-1/3 mb-8 md:mb-0 fade-up">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Resources</h2>
                <p className="text-gray-600 mb-6">
                  Access chords, lyrics, and other helpful resources for our worship team.
                </p>
                <div className="bg-goodtree-lighter p-4 rounded-lg">
                  <h3 className="font-semibold text-goodtree mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-700">
                    If you need access to additional resources or have questions about the ministry, 
                    please contact the worship leader.
                  </p>
                </div>
              </div>
              <div className="md:w-2/3 md:pl-8 fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-goodtree mb-4">Chords & Lyrics</h3>
                    <div className="h-[400px] border rounded-lg overflow-hidden">
                      <iframe 
                        id="pdfViewer" 
                        src="https://drive.google.com/file/d/1V671ZKsWTom_5BxeEk7TFIKQKW9_WvKA/preview" 
                        width="100%" 
                        height="100%" 
                        className="border-0"
                      >
                        Your browser does not support PDFs.
                      </iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-goodtree text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <img 
                  src="/lovable-uploads/11ec3d18-cf25-4232-b280-5199f06af73b.png" 
                  alt="Good Tree Church Logo" 
                  className="h-10 w-10" 
                />
                <div>
                  <div className="font-bold">Good Tree Church</div>
                  <div className="text-sm opacity-80">Worship Ministry</div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:space-x-8 items-center">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-white opacity-80 hover:opacity-100 transition-opacity py-2"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-white/20 mt-6 pt-6 text-center text-sm opacity-70">
              <p>© {new Date().getFullYear()} Good Tree Church Worship Ministry. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
