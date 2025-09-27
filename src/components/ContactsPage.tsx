import React, { useState, useEffect, useMemo } from 'react';
import { Contact, ContactSearchFilters, Theme } from '../types';
import './ContactsPage.css';

interface ContactsPageProps {
  theme: Theme;
  onStartCall: (contact: Contact) => void;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ theme, onStartCall }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchFilters, setSearchFilters] = useState<ContactSearchFilters>({
    query: '',
    scamRiskOnly: false,
    riskLevel: undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    notes: ''
  });

  // Load contacts from localStorage on component mount
  useEffect(() => {
    console.log('Loading contacts from localStorage...');
    const savedContacts = localStorage.getItem('clearcall-contacts');
    console.log('Saved contacts from localStorage:', savedContacts);
    
    if (savedContacts) {
      try {
        const parsedContacts = JSON.parse(savedContacts).map((contact: any) => ({
          ...contact,
          lastCallDate: contact.lastCallDate ? new Date(contact.lastCallDate) : undefined,
          createdAt: new Date(contact.createdAt),
          updatedAt: new Date(contact.updatedAt)
        }));
        console.log('Parsed contacts:', parsedContacts.length);
        setContacts(parsedContacts);
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    } else {
      // Add sample contacts if none exist
      const sampleContacts: Contact[] = [
      {
        id: '1',
        name: 'Mom',
        phoneNumber: '+1 (555) 123-4567',
        email: 'mom@family.com',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        totalCalls: 15,
        scamWarnings: 0,
        notes: 'Family member - always safe to call',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Dad',
        phoneNumber: '+1 (555) 123-4568',
        email: 'dad@family.com',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        totalCalls: 8,
        scamWarnings: 0,
        notes: 'Family member - safe to call',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Sarah Johnson',
        phoneNumber: '+1 (555) 456-7890',
        email: 'sarah.j@company.com',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        totalCalls: 12,
        scamWarnings: 0,
        notes: 'Best friend from college',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Mike Chen',
        phoneNumber: '+1 (555) 987-6543',
        email: 'mike.chen@techcorp.com',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        totalCalls: 8,
        scamWarnings: 0,
        notes: 'Work colleague - project manager',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Dr. Williams',
        phoneNumber: '+1 (555) 234-5678',
        email: 'dr.williams@clinic.com',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        totalCalls: 4,
        scamWarnings: 0,
        notes: 'Family doctor - legitimate medical calls',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Emma Rodriguez',
        phoneNumber: '+1 (555) 345-6789',
        email: 'emma.r@email.com',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        totalCalls: 6,
        scamWarnings: 0,
        notes: 'Neighbor - book club friend',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '7',
        name: 'Alex Thompson',
        phoneNumber: '+1 (555) 567-8901',
        email: 'alex.t@gym.com',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        totalCalls: 3,
        scamWarnings: 0,
        notes: 'Gym buddy - workout partner',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '8',
        name: 'Lisa Park',
        phoneNumber: '+1 (555) 678-9012',
        email: 'lisa.park@restaurant.com',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        totalCalls: 2,
        scamWarnings: 0,
        notes: 'Restaurant owner - business contact',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '9',
        name: 'James Wilson',
        phoneNumber: '+1 (555) 789-0123',
        email: 'james.w@bank.com',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
        totalCalls: 1,
        scamWarnings: 0,
        notes: 'Bank representative - legitimate business',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '10',
        name: 'Maria Garcia',
        phoneNumber: '+1 (555) 890-1234',
        email: 'maria.g@school.edu',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        totalCalls: 5,
        scamWarnings: 0,
        notes: 'Teacher - child\'s school contact',
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '11',
        name: 'David Kim',
        phoneNumber: '+1 (555) 901-2345',
        email: 'david.k@delivery.com',
        isScamRisk: false,
        scamRiskLevel: 'low',
        scamReasons: [],
        lastCallDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        totalCalls: 7,
        scamWarnings: 0,
        notes: 'Delivery driver - regular service',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '12',
        name: 'Tech Support Scam',
        phoneNumber: '+1 (555) 999-8888',
        email: undefined,
        isScamRisk: true,
        scamRiskLevel: 'high',
        scamReasons: ['Claimed to be tech support', 'Asked for remote access', 'Urgent payment request'],
        lastCallDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        totalCalls: 1,
        scamWarnings: 8,
        notes: 'BLOCKED - Confirmed scammer',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '13',
        name: 'IRS Scam Caller',
        phoneNumber: '+1 (555) 000-0000',
        email: undefined,
        isScamRisk: true,
        scamRiskLevel: 'high',
        scamReasons: ['Claimed to be IRS', 'Demanded immediate payment', 'Threatened legal action'],
        lastCallDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        totalCalls: 3,
        scamWarnings: 12,
        notes: 'BLOCKED - IRS impersonation scam',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '14',
        name: 'Warranty Scam',
        phoneNumber: '+1 (555) 111-2222',
        email: undefined,
        isScamRisk: true,
        scamRiskLevel: 'medium',
        scamReasons: ['Car warranty offer', 'High-pressure sales tactics', 'Suspicious caller ID'],
        lastCallDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        totalCalls: 2,
        scamWarnings: 4,
        notes: 'BLOCKED - Warranty scam attempt',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '15',
        name: 'Unknown Caller',
        phoneNumber: '+1 (555) 333-4444',
        email: undefined,
        isScamRisk: true,
        scamRiskLevel: 'high',
        scamReasons: ['Suspicious call patterns', 'Requested personal information', 'Robocall detected'],
        lastCallDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        totalCalls: 5,
        scamWarnings: 6,
        notes: 'BLOCKED - Unknown suspicious caller',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
      ];
      console.log('Creating sample contacts:', sampleContacts.length);
      setContacts(sampleContacts);
      // Save sample contacts to localStorage immediately
      try {
        localStorage.setItem('clearcall-contacts', JSON.stringify(sampleContacts));
        console.log('Sample contacts saved to localStorage');
      } catch (error) {
        console.error('Error saving sample contacts:', error);
      }
    }
  }, []);

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('clearcall-contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Filter and sort contacts based on search criteria
  const filteredContacts = useMemo(() => {
    console.log('Total contacts:', contacts.length);
    console.log('Search filters:', searchFilters);
    
    let filtered = contacts.filter(contact => {
      const matchesQuery = !searchFilters.query || 
        contact.name.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        contact.phoneNumber.includes(searchFilters.query) ||
        (contact.email && contact.email.toLowerCase().includes(searchFilters.query.toLowerCase()));
      
      const matchesScamRisk = !searchFilters.scamRiskOnly || contact.isScamRisk;
      const matchesRiskLevel = !searchFilters.riskLevel || contact.scamRiskLevel === searchFilters.riskLevel;
      
      return matchesQuery && matchesScamRisk && matchesRiskLevel;
    });
    
    console.log('Filtered contacts:', filtered.length);

    // Sort contacts
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (searchFilters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastCall':
          const aDate = a.lastCallDate || new Date(0);
          const bDate = b.lastCallDate || new Date(0);
          comparison = aDate.getTime() - bDate.getTime();
          break;
        case 'scamWarnings':
          comparison = a.scamWarnings - b.scamWarnings;
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      
      return searchFilters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [contacts, searchFilters]);

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.phoneNumber.trim()) {
      alert('Please fill in name and phone number');
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name.trim(),
      phoneNumber: newContact.phoneNumber.trim(),
      email: newContact.email.trim() || undefined,
      isScamRisk: false,
      scamRiskLevel: 'low',
      scamReasons: [],
      totalCalls: 0,
      scamWarnings: 0,
      notes: newContact.notes.trim() || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setContacts(prev => [contact, ...prev]);
    setNewContact({ name: '', phoneNumber: '', email: '', notes: '' });
    setShowAddForm(false);
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
    }
  };

  const handleMarkAsScam = (contactId: string, isScam: boolean) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { 
            ...contact, 
            isScamRisk: isScam,
            scamRiskLevel: isScam ? 'high' : 'low',
            scamReasons: isScam ? ['Manually flagged by user'] : [],
            updatedAt: new Date()
          }
        : contact
    ));
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return '#ff4444';
      case 'medium': return '#ff8800';
      case 'low': return '#44aa44';
      default: return '#888888';
    }
  };

  return (
    <div className="contacts-page" style={{ 
      backgroundColor: theme.backgroundColor,
      color: theme.textColor
    }}>
      <div className="contacts-header">
        <button 
          className="add-contact-button"
          onClick={() => setShowAddForm(true)}
          style={{
            backgroundColor: theme.buttonColor,
            color: theme.buttonText
          }}
        >
          + Add Contact
        </button>
      </div>

      <div className="contacts-content">
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchFilters.query}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
              style={{
                backgroundColor: theme.captionBackground,
                color: theme.textColor,
                border: `1px solid ${theme.buttonColor}`
              }}
            />
          </div>
          
          <div className="filters">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={searchFilters.scamRiskOnly}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, scamRiskOnly: e.target.checked }))}
              />
              Show scam risks only
            </label>
            
            <select
              value={searchFilters.riskLevel || ''}
              onChange={(e) => setSearchFilters(prev => ({ 
                ...prev, 
                riskLevel: e.target.value as 'low' | 'medium' | 'high' | undefined 
              }))}
              style={{
                backgroundColor: theme.captionBackground,
                color: theme.textColor,
                border: `1px solid ${theme.buttonColor}`
              }}
            >
              <option value="">All risk levels</option>
              <option value="low">Low risk</option>
              <option value="medium">Medium risk</option>
              <option value="high">High risk</option>
            </select>
            
            <select
              value={`${searchFilters.sortBy}-${searchFilters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setSearchFilters(prev => ({ 
                  ...prev, 
                  sortBy: sortBy as any,
                  sortOrder: sortOrder as 'asc' | 'desc'
                }));
              }}
              style={{
                backgroundColor: theme.captionBackground,
                color: theme.textColor,
                border: `1px solid ${theme.buttonColor}`
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="lastCall-desc">Last Call (Recent)</option>
              <option value="scamWarnings-desc">Most Scam Warnings</option>
              <option value="createdAt-desc">Recently Added</option>
            </select>
          </div>
        </div>

        <div className={`contacts-layout ${selectedContact ? 'with-details' : 'full-width'}`}>
          <div className="contacts-list">
            <h3>Contacts ({filteredContacts.length})</h3>
            {filteredContacts.length === 0 ? (
              <div className="no-contacts">
                <p>No contacts found matching your criteria.</p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  style={{
                    backgroundColor: theme.buttonColor,
                    color: theme.buttonText
                  }}
                >
                  Add your first contact
                </button>
              </div>
            ) : (
              <div className="contacts-table">
                <div className="table-header">
                  <div className="table-cell name-header">Name</div>
                  <div className="table-cell phone-header">Phone Number</div>
                  <div className="table-cell email-header">Email</div>
                  <div className="table-cell calls-header">Calls</div>
                  <div className="table-cell warnings-header">Warnings</div>
                  <div className="table-cell risk-header">Risk Level</div>
                  <div className="table-cell actions-header">Actions</div>
                </div>
                
                <div className="table-body">
                  {filteredContacts.map(contact => (
                    <div 
                      key={contact.id}
                      className={`table-row ${selectedContact?.id === contact.id ? 'selected' : ''} ${contact.isScamRisk ? 'scam-risk' : ''}`}
                      onClick={() => setSelectedContact(contact)}
                      style={{
                        backgroundColor: selectedContact?.id === contact.id ? '#dbeafe' : '#ffffff',
                        color: selectedContact?.id === contact.id ? '#1e40af' : '#1e40af',
                        borderLeft: contact.isScamRisk ? `4px solid ${getRiskLevelColor(contact.scamRiskLevel)}` : '4px solid transparent'
                      }}
                    >
                      <div className="table-cell name-cell" data-label="Name">
                        <div className="contact-name-info">
                          <div className="contact-name">
                            {contact.name}
                            {contact.isScamRisk && <span className="scam-indicator">⚠️</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="table-cell phone-cell" data-label="Phone">
                        <div className="contact-phone-info">
                          {contact.phoneNumber}
                        </div>
                      </div>
                      
                      <div className="table-cell email-cell" data-label="Email">
                        <div className="contact-email-info">
                          {contact.email || '—'}
                        </div>
                      </div>
                      
                      <div className="table-cell calls-cell" data-label="Calls">
                        <div className="calls-badge">
                          {contact.totalCalls}
                        </div>
                      </div>
                      
                      <div className="table-cell warnings-cell" data-label="Warnings">
                        <div 
                          className="warnings-badge"
                          style={{ 
                            backgroundColor: contact.scamWarnings > 0 ? theme.warningColor + '20' : '#f0f9ff',
                            color: contact.scamWarnings > 0 ? theme.warningColor : '#64748b',
                            border: contact.scamWarnings > 0 ? `1px solid ${theme.warningColor}` : '1px solid #e2e8f0'
                          }}
                        >
                          {contact.scamWarnings}
                        </div>
                      </div>
                      
                      <div className="table-cell risk-cell" data-label="Risk">
                        <div 
                          className="risk-badge"
                          style={{
                            backgroundColor: getRiskLevelColor(contact.scamRiskLevel) + '20',
                            color: getRiskLevelColor(contact.scamRiskLevel),
                            border: `1px solid ${getRiskLevelColor(contact.scamRiskLevel)}`
                          }}
                        >
                          {contact.scamRiskLevel.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="table-cell actions-cell" data-label="Actions">
                        <button 
                          className="call-contact-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartCall(contact);
                          }}
                          style={{
                            backgroundColor: theme.buttonColor,
                            color: theme.buttonText
                          }}
                        >
                          📞
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedContact && (
            <div className="contact-details">
              <div className="contact-details-header">
                <h3>{selectedContact.name}</h3>
                <div className="contact-actions">
                  <button
                    onClick={() => handleMarkAsScam(selectedContact.id, !selectedContact.isScamRisk)}
                    style={{
                      backgroundColor: selectedContact.isScamRisk ? '#44aa44' : theme.warningColor,
                      color: 'white'
                    }}
                  >
                    {selectedContact.isScamRisk ? 'Mark as Safe' : 'Mark as Scam'}
                  </button>
                  <button
                    onClick={() => handleDeleteContact(selectedContact.id)}
                    style={{
                      backgroundColor: '#ff4444',
                      color: 'white'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="contact-details-content">
                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <p><strong>Phone:</strong> {selectedContact.phoneNumber}</p>
                  {selectedContact.email && <p><strong>Email:</strong> {selectedContact.email}</p>}
                  <p><strong>Added:</strong> {selectedContact.createdAt.toLocaleDateString()}</p>
                  {selectedContact.lastCallDate && (
                    <p><strong>Last Call:</strong> {selectedContact.lastCallDate.toLocaleDateString()}</p>
                  )}
                </div>
                
                <div className="detail-section">
                  <h4>Scam Risk Assessment</h4>
                  <div className="risk-indicator" style={{ color: getRiskLevelColor(selectedContact.scamRiskLevel) }}>
                    <strong>Risk Level:</strong> {selectedContact.scamRiskLevel.toUpperCase()}
                  </div>
                  <p><strong>Total Calls:</strong> {selectedContact.totalCalls}</p>
                  <p><strong>Scam Warnings:</strong> {selectedContact.scamWarnings}</p>
                  {selectedContact.scamReasons.length > 0 && (
                    <div>
                      <strong>Risk Reasons:</strong>
                      <ul>
                        {selectedContact.scamReasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {selectedContact.notes && (
                  <div className="detail-section">
                    <h4>Notes</h4>
                    <p>{selectedContact.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
            <div className="modal-header">
              <h3>Add New Contact</h3>
              <button 
                className="close-button"
                onClick={() => setShowAddForm(false)}
                style={{ color: theme.textColor }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    backgroundColor: theme.captionBackground,
                    color: theme.textColor,
                    border: `1px solid ${theme.buttonColor}`
                  }}
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={newContact.phoneNumber}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  style={{
                    backgroundColor: theme.captionBackground,
                    color: theme.textColor,
                    border: `1px solid ${theme.buttonColor}`
                  }}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    backgroundColor: theme.captionBackground,
                    color: theme.textColor,
                    border: `1px solid ${theme.buttonColor}`
                  }}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  style={{
                    backgroundColor: theme.captionBackground,
                    color: theme.textColor,
                    border: `1px solid ${theme.buttonColor}`
                  }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowAddForm(false)}
                style={{
                  backgroundColor: theme.captionBackground,
                  color: theme.textColor
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddContact}
                style={{
                  backgroundColor: theme.buttonColor,
                  color: theme.buttonText
                }}
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
