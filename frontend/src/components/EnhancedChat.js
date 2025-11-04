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
        sender_id: userId,
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
            sender_id: userId,
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
  const shareContact = () => {
    const contact = prompt('Enter contact details (Name: Number)');
    if (contact) {
      sendContactMessage(contact);
    }
    setShowAttachMenu(false);
  };
  
  const sendContactMessage = async (contactInfo) => {
    try {
      const token = localStorage.getItem('token');
      const messageData = {
        sender_id: userId,
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
        sender_id: userId,
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
        setGroupName('');
        setGroupDescription('');
        setGroupIcon('👥');
        setSelectedMembers([]);
        setView('list');
        fetchGroups();
      }
    } catch (error) {
      console.error('Error creating group:', error);
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
    setView('list');
    setSelectedPeer(null);
    setSelectedGroup(null);
    setMessages([]);
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
            <span className="flex-1 text-center">
              {view === 'list' && 'Chats'}
              {view === 'chat' && selectedPeer?.name}
              {view === 'group-chat' && selectedGroup?.name}
              {view === 'create-group' && 'New Group'}
              {view === 'group-settings' && 'Group Settings'}
            </span>
            {view === 'list' && (
              <Button 
                onClick={() => setView('create-group')} 
                variant="ghost" 
                size="sm"
                className="text-cyan-400"
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}
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
                {messages.map((msg) => (
                  <div key={msg.message_id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-lg p-3 ${
                      msg.sender_id === userId 
                        ? 'bg-green-600 text-white' 
                        : 'bg-slate-700 text-white'
                    }`}>
                      {msg.message_type === 'text' && <div className="text-sm">{msg.content}</div>}
                      {msg.message_type === 'image' && (
                        <div className="text-xs text-slate-300">📷 Image</div>
                      )}
                      {msg.message_type === 'audio' && (
                        <div className="text-xs text-slate-300">🎵 Audio</div>
                      )}
                      {msg.message_type === 'document' && (
                        <div className="text-xs text-slate-300">📄 {msg.metadata?.file_name || 'Document'}</div>
                      )}
                      {msg.message_type === 'contact' && (
                        <div className="text-xs text-slate-300">👤 {msg.content}</div>
                      )}
                      {msg.message_type === 'location' && (
                        <div className="text-xs text-slate-300">📍 Location</div>
                      )}
                    </div>
                  </div>
                ))}
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
                    variant="outline"
                    size="sm"
                    className="border-slate-600"
                  >
                    <Paperclip className="w-4 h-4" />
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
        </div>
        
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
