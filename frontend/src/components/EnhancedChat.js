import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  ArrowLeft, Send, Image as ImageIcon, Mic, FileText, Phone, MapPin, 
  Users, Plus, Settings, X, Paperclip, Check, MoreVertical 
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const EnhancedChat = ({ open, onOpenChange, userId }) => {
  const [view, setView] = useState('list'); // 'list', 'chat', 'group-chat', 'create-group', 'group-settings'
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  // Group creation states
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupIcon, setGroupIcon] = useState('👥');
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  // Group settings states
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupIcon, setEditGroupIcon] = useState('');
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  
  // File preview state
  const [previewFile, setPreviewFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Fetch contacts
  useEffect(() => {
    if (open) {
      fetchContacts();
      fetchGroups();
    }
  }, [open]);
  
  // Auto-refresh messages every 3 seconds when in chat view
  useEffect(() => {
    if ((view === 'chat' || view === 'group-chat') && (selectedPeer || selectedGroup)) {
      const interval = setInterval(() => {
        if (selectedPeer) {
          fetchMessages(selectedPeer.id);
        } else if (selectedGroup) {
          fetchGroupMessages(selectedGroup.group_id);
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [view, selectedPeer, selectedGroup]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };
  
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chat/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      } else {
        console.error('Error fetching groups:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };
  
  // Fetch messages for peer
  const fetchMessages = async (peerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chat/messages/${peerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Error fetching messages:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  // Fetch group messages
  const fetchGroupMessages = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chat/group/${groupId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Error fetching group messages:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching group messages:', error);
    }
  };
  
  // Send text message
  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const messageData = {
        receiver_id: selectedPeer?.id || null,
        group_id: selectedGroup?.group_id || null,
        message_type: 'text',
        content: messageInput,
        metadata: {}
      };
      
      const response = await fetch(`${BACKEND_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });
      
      if (response.ok) {
        setMessageInput('');
        // Refresh messages
        if (selectedPeer) {
          fetchMessages(selectedPeer.id);
        } else if (selectedGroup) {
          fetchGroupMessages(selectedGroup.group_id);
        }
      } else {
        console.error('Error sending message:', await response.text());
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Upload and send file
  const uploadFile = async (file, messageType) => {
    try {
      const token = localStorage.getItem('token');
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        
        const uploadData = {
          file_name: file.name,
          file_type: file.type,
          file_data: base64Data,
          message_type: messageType
        };
        
        const uploadResponse = await fetch(`${BACKEND_URL}/api/chat/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(uploadData)
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          
          // Send message with file URL
          const messageData = {
            receiver_id: selectedPeer?.id || null,
            group_id: selectedGroup?.group_id || null,
            message_type: messageType,
            content: uploadResult.file_url,
            metadata: {
              file_name: file.name,
              file_type: file.type,
              file_id: uploadResult.file_id
            }
          };
          
          await fetch(`${BACKEND_URL}/api/chat/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messageData)
          });
          
          // Refresh messages
          if (selectedPeer) {
            fetchMessages(selectedPeer.id);
          } else if (selectedGroup) {
            fetchGroupMessages(selectedGroup.group_id);
          }
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file, type);
    }
    event.target.value = '';
    setShowAttachMenu(false);
  };
  
  // Share contact
  const shareContact = async () => {
    try {
      // Check if Contact Picker API is supported
      if ('contacts' in navigator && 'ContactsManager' in window) {
        // Request contact with name and tel (phone number)
        const props = ['name', 'tel'];
        const opts = { multiple: false };
        
        // This will open the native contact picker
        const contacts = await navigator.contacts.select(props, opts);
        
        if (contacts && contacts.length > 0) {
          const contact = contacts[0];
          const name = contact.name || 'Unknown';
          const phone = contact.tel && contact.tel.length > 0 ? contact.tel[0] : 'No number';
          const contactInfo = `${name}: ${phone}`;
          
          sendContactMessage(contactInfo);
        }
      } else {
        // Fallback for browsers that don't support Contact Picker API
        alert('⚠️ Contact Picker not supported on this browser.\n\nPlease use Chrome/Edge on Android or Safari on iOS for native contact selection.\n\nFalling back to manual entry...');
        
        const contact = prompt('Enter contact details (Name: Number)');
        if (contact) {
          sendContactMessage(contact);
        }
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error.name === 'AbortError') {
        console.log('Contact selection cancelled');
      } else {
        console.error('Error accessing contacts:', error);
        alert('Unable to access contacts. Please check permissions or enter manually.');
        
        // Fallback to manual entry
        const contact = prompt('Enter contact details (Name: Number)');
        if (contact) {
          sendContactMessage(contact);
        }
      }
    }
    setShowAttachMenu(false);
  };
  
  const sendContactMessage = async (contactInfo) => {
    try {
      const token = localStorage.getItem('token');
      const messageData = {
        receiver_id: selectedPeer?.id || null,
        group_id: selectedGroup?.group_id || null,
        message_type: 'contact',
        content: contactInfo,
        metadata: {}
      };
      
      await fetch(`${BACKEND_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });
      
      if (selectedPeer) {
        fetchMessages(selectedPeer.id);
      } else if (selectedGroup) {
        fetchGroupMessages(selectedGroup.group_id);
      }
    } catch (error) {
      console.error('Error sending contact:', error);
    }
  };
  
  // Share location
  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        sendLocationMessage(lat, lng);
      }, (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location');
      });
    } else {
      alert('Geolocation is not supported by your browser');
    }
    setShowAttachMenu(false);
  };
  
  const sendLocationMessage = async (lat, lng) => {
    try {
      const token = localStorage.getItem('token');
      const messageData = {
        receiver_id: selectedPeer?.id || null,
        group_id: selectedGroup?.group_id || null,
        message_type: 'location',
        content: `Location: ${lat}, ${lng}`,
        metadata: { latitude: lat, longitude: lng }
      };
      
      await fetch(`${BACKEND_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });
      
      if (selectedPeer) {
        fetchMessages(selectedPeer.id);
      } else if (selectedGroup) {
        fetchGroupMessages(selectedGroup.group_id);
      }
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };
  
  // Create group
  const createGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const groupData = {
        name: groupName,
        description: groupDescription,
        icon: groupIcon,
        members: selectedMembers
      };
      
      const response = await fetch(`${BACKEND_URL}/api/chat/group/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Group created successfully:', result);
        alert('Group created successfully!');
        setGroupName('');
        setGroupDescription('');
        setGroupIcon('👥');
        setSelectedMembers([]);
        setView('list');
        fetchGroups();
      } else if (response.status === 401) {
        // Token expired or invalid
        alert('⚠️ Your session has expired!\n\nPlease follow these steps:\n1. Click your profile icon (top-right)\n2. Click "Logout"\n3. Login again with your mobile number\n\nThis will refresh your session.');
        onOpenChange(false); // Close the chat dialog
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Error creating group:', errorData);
        alert('Failed to create group: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group: ' + error.message);
    }
  };
  
  // Select peer for chat
  const selectPeer = (peer) => {
    setSelectedPeer(peer);
    setSelectedGroup(null);
    setView('chat');
    fetchMessages(peer.id);
  };
  
  // Select group for chat
  const selectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedPeer(null);
    setView('group-chat');
    fetchGroupMessages(group.group_id);
  };
  
  // Go back to list
  const goBack = () => {
    if (view === 'group-settings') {
      setView('group-chat');
    } else {
      setView('list');
      setSelectedPeer(null);
      setSelectedGroup(null);
      setMessages([]);
    }
  };
  
  // Open group settings
  const openGroupSettings = () => {
    setEditGroupName(selectedGroup.name);
    setEditGroupDescription(selectedGroup.description);
    setEditGroupIcon(selectedGroup.icon);
    setView('group-settings');
  };
  
  // Update group settings
  const updateGroupSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chat/group/${selectedGroup.group_id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editGroupName,
          description: editGroupDescription,
          icon: editGroupIcon
        })
      });
      
      if (response.ok) {
        // Update local state
        setSelectedGroup({
          ...selectedGroup,
          name: editGroupName,
          description: editGroupDescription,
          icon: editGroupIcon
        });
        fetchGroups(); // Refresh groups list
        alert('Group settings updated successfully');
      }
    } catch (error) {
      console.error('Error updating group settings:', error);
      alert('Failed to update group settings');
    }
  };
  
  // Add member to group
  const addMemberToGroup = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chat/group/${selectedGroup.group_id}/add-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ member_id: memberId })
      });
      
      if (response.ok) {
        // Update local state
        setSelectedGroup({
          ...selectedGroup,
          members: [...selectedGroup.members, memberId]
        });
        fetchGroups();
        alert('Member added successfully');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    }
  };
  
  // Remove member from group
  const removeMemberFromGroup = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chat/group/${selectedGroup.group_id}/remove-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ member_id: memberId })
      });
      
      if (response.ok) {
        // Update local state
        setSelectedGroup({
          ...selectedGroup,
          members: selectedGroup.members.filter(id => id !== memberId)
        });
        fetchGroups();
        alert('Member removed successfully');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };
  
  // Make member admin
  const makeAdmin = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chat/group/${selectedGroup.group_id}/make-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ member_id: memberId })
      });
      
      if (response.ok) {
        // Update local state
        setSelectedGroup({
          ...selectedGroup,
          admins: [...selectedGroup.admins, memberId]
        });
        fetchGroups();
        alert('Member is now an admin');
      }
    } catch (error) {
      console.error('Error making admin:', error);
      alert('Failed to make admin');
    }
  };
  
  // Get available contacts for adding to group
  const getAvailableContacts = () => {
    return contacts.filter(contact => !selectedGroup.members.includes(contact.id));
  };
  
  // Preview file
  const previewFileHandler = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/chat/file/${fileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewFile(data);
        setShowFilePreview(true);
      }
    } catch (error) {
      console.error('Error fetching file:', error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md h-[600px] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-slate-700 flex-shrink-0">
          <DialogTitle className="text-white flex items-center justify-between">
            {view !== 'list' && (
              <Button onClick={goBack} variant="ghost" size="sm" className="p-1 h-6 w-6">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {view === 'list' && <div className="w-6"></div>}
            <span className="flex-1 text-center">
              {view === 'list' && 'Chats'}
              {view === 'chat' && selectedPeer?.name}
              {view === 'group-chat' && selectedGroup?.name}
              {view === 'create-group' && 'New Group'}
              {view === 'group-settings' && 'Group Settings'}
            </span>
            <div className="flex items-center gap-2">
              {view === 'list' && (
                <Button 
                  onClick={() => setView('create-group')} 
                  variant="ghost" 
                  size="sm"
                  className="text-cyan-400 p-1 h-8 w-8"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              )}
              {view === 'group-chat' && selectedGroup && selectedGroup.admins.includes(userId) && (
                <Button 
                  onClick={openGroupSettings} 
                  variant="ghost" 
                  size="sm"
                  className="text-cyan-400 p-1 h-8 w-8"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              )}
              <Button 
                onClick={() => onOpenChange(false)} 
                size="sm"
                className="bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 text-red-400 hover:text-red-300 p-1 h-8 w-8 rounded-md"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'list' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Groups Section */}
              {groups.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-slate-400 mb-2">Groups ({groups.length})</div>
                  {groups.map((group) => (
                    <div
                      key={group.group_id}
                      onClick={() => selectGroup(group)}
                      className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer"
                    >
                      <span className="text-2xl">{group.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{group.name}</div>
                        <div className="text-xs text-slate-400">{group.members.length} members</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Contacts Section */}
              <div className="text-xs text-slate-400 mb-2">Contacts ({contacts.length})</div>
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => selectPeer(contact)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer"
                >
                  <span className="text-2xl">{contact.avatar || '👤'}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{contact.name}</div>
                    <div className="text-xs text-slate-400">{contact.type || 'Contact'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {(view === 'chat' || view === 'group-chat') && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-slate-400 text-sm mt-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.message_id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-lg p-3 ${
                      msg.sender_id === userId 
                        ? 'bg-green-600 text-white' 
                        : 'bg-slate-700 text-white'
                    }`}>
                      {msg.message_type === 'text' && <div className="text-sm">{msg.content}</div>}
                      {msg.message_type === 'image' && (
                        <div 
                          className="cursor-pointer"
                          onClick={() => msg.metadata?.file_id && previewFileHandler(msg.metadata.file_id)}
                        >
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <div className="text-xs">📷 {msg.metadata?.file_name || 'Image'}</div>
                        </div>
                      )}
                      {msg.message_type === 'audio' && (
                        <div 
                          className="cursor-pointer"
                          onClick={() => msg.metadata?.file_id && previewFileHandler(msg.metadata.file_id)}
                        >
                          <Mic className="w-8 h-8 mb-1" />
                          <div className="text-xs">🎵 {msg.metadata?.file_name || 'Audio'}</div>
                        </div>
                      )}
                      {msg.message_type === 'document' && (
                        <div 
                          className="cursor-pointer"
                          onClick={() => msg.metadata?.file_id && previewFileHandler(msg.metadata.file_id)}
                        >
                          <FileText className="w-8 h-8 mb-1" />
                          <div className="text-xs">📄 {msg.metadata?.file_name || 'Document'}</div>
                        </div>
                      )}
                      {msg.message_type === 'contact' && (
                        <div>
                          <Phone className="w-6 h-6 mb-1" />
                          <div className="text-xs">👤 Contact</div>
                          <div className="text-sm mt-1">{msg.content}</div>
                        </div>
                      )}
                      {msg.message_type === 'location' && (
                        <div 
                          className="cursor-pointer"
                          onClick={() => {
                            const lat = msg.metadata?.latitude;
                            const lng = msg.metadata?.longitude;
                            if (lat && lng) {
                              window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                            }
                          }}
                        >
                          <MapPin className="w-6 h-6 mb-1" />
                          <div className="text-xs">📍 Location</div>
                          <div className="text-xs mt-1 underline">View on map</div>
                        </div>
                      )}
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t border-slate-700 flex-shrink-0">
                {showAttachMenu && (
                  <div className="mb-2 grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => imageInputRef.current?.click()}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Image
                    </Button>
                    <Button
                      onClick={() => audioInputRef.current?.click()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Mic className="w-4 h-4 mr-1" />
                      Audio
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      File
                    </Button>
                    <Button
                      onClick={shareContact}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button
                      onClick={shareLocation}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    size="sm"
                    className="bg-slate-700 hover:bg-slate-600 border-2 border-cyan-500 text-cyan-400"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-700 border-slate-600 text-white"
                  />
                  <Button onClick={sendMessage} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {view === 'create-group' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Group Name</label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Description</label>
                <Input
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Group description (optional)"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Select Members</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => {
                        if (selectedMembers.includes(contact.id)) {
                          setSelectedMembers(selectedMembers.filter(id => id !== contact.id));
                        } else {
                          setSelectedMembers([...selectedMembers, contact.id]);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        selectedMembers.includes(contact.id) ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <span className="text-xl">{contact.avatar || '👤'}</span>
                      <span className="text-sm text-white">{contact.name}</span>
                      {selectedMembers.includes(contact.id) && <Check className="w-4 h-4 ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={createGroup}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Create Group
              </Button>
            </div>
          )}
          
          {view === 'group-settings' && selectedGroup && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Group Info */}
              <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Group Icon</label>
                  <Input
                    value={editGroupIcon}
                    onChange={(e) => setEditGroupIcon(e.target.value)}
                    placeholder="👥"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Group Name</label>
                  <Input
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Description</label>
                  <Input
                    value={editGroupDescription}
                    onChange={(e) => setEditGroupDescription(e.target.value)}
                    placeholder="Group description"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                
                <Button
                  onClick={updateGroupSettings}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Update Settings
                </Button>
              </div>
              
              {/* Members Management */}
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Members ({selectedGroup.members.length})</h3>
                  <Button
                    onClick={() => {
                      setAvailableContacts(getAvailableContacts());
                      setShowAddMemberDialog(true);
                    }}
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedGroup.members.map((memberId) => {
                    const contact = contacts.find(c => c.id === memberId);
                    const isAdmin = selectedGroup.admins.includes(memberId);
                    const isCreator = selectedGroup.created_by === memberId;
                    const canManage = selectedGroup.admins.includes(userId) && !isCreator && memberId !== userId;
                    
                    return (
                      <div
                        key={memberId}
                        className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg"
                      >
                        <span className="text-xl">{contact?.avatar || '👤'}</span>
                        <div className="flex-1">
                          <div className="text-sm text-white">{contact?.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-400">
                            {isCreator ? '👑 Creator' : isAdmin ? '⭐ Admin' : 'Member'}
                          </div>
                        </div>
                        {canManage && (
                          <div className="flex gap-1">
                            {!isAdmin && (
                              <Button
                                onClick={() => makeAdmin(memberId)}
                                size="sm"
                                variant="outline"
                                className="text-xs border-cyan-600 text-cyan-400"
                              >
                                Make Admin
                              </Button>
                            )}
                            <Button
                              onClick={() => removeMemberFromGroup(memberId)}
                              size="sm"
                              variant="outline"
                              className="text-xs border-red-600 text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Admins List */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Admins ({selectedGroup.admins.length})</h3>
                <div className="space-y-2">
                  {selectedGroup.admins.map((adminId) => {
                    const contact = contacts.find(c => c.id === adminId);
                    const isCreator = selectedGroup.created_by === adminId;
                    
                    return (
                      <div
                        key={adminId}
                        className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg"
                      >
                        <span className="text-xl">{contact?.avatar || '👤'}</span>
                        <div className="flex-1">
                          <div className="text-sm text-white">{contact?.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-400">
                            {isCreator ? '👑 Creator' : '⭐ Admin'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Add Member Dialog */}
        {showAddMemberDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Add Members</h3>
                <Button
                  onClick={() => setShowAddMemberDialog(false)}
                  size="sm"
                  className="bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 text-red-400 hover:text-red-300 p-1 h-8 w-8 rounded-md"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {availableContacts.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm py-4">
                    No contacts available to add
                  </div>
                ) : (
                  availableContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => {
                        addMemberToGroup(contact.id);
                        setShowAddMemberDialog(false);
                      }}
                      className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer"
                    >
                      <span className="text-xl">{contact.avatar || '👤'}</span>
                      <span className="text-sm text-white">{contact.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* File Preview Dialog */}
        {showFilePreview && previewFile && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{previewFile.file_name}</h3>
                <Button
                  onClick={() => {
                    setShowFilePreview(false);
                    setPreviewFile(null);
                  }}
                  size="sm"
                  className="bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500 text-red-400 hover:text-red-300 p-1 h-8 w-8 rounded-md"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="bg-slate-900 rounded-lg p-4 text-center">
                {previewFile.file_type.startsWith('image/') && (
                  <img 
                    src={`data:${previewFile.file_type};base64,${previewFile.file_data}`} 
                    alt={previewFile.file_name}
                    className="max-w-full max-h-96 mx-auto"
                  />
                )}
                {previewFile.file_type.startsWith('audio/') && (
                  <audio controls className="w-full">
                    <source src={`data:${previewFile.file_type};base64,${previewFile.file_data}`} />
                  </audio>
                )}
                {!previewFile.file_type.startsWith('image/') && !previewFile.file_type.startsWith('audio/') && (
                  <div className="text-slate-400 text-sm">
                    <FileText className="w-16 h-16 mx-auto mb-2" />
                    <p>File type: {previewFile.file_type}</p>
                    <p>Size: {(previewFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                )}
              </div>
              
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `data:${previewFile.file_type};base64,${previewFile.file_data}`;
                  link.download = previewFile.file_name;
                  link.click();
                }}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Download
              </Button>
            </div>
          </div>
        )}
        
        {/* Hidden File Inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'image')}
          className="hidden"
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileSelect(e, 'audio')}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileSelect(e, 'document')}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedChat;
