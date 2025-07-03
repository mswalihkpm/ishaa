import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import {
  Paperclip,
  Send,
  Trash2,
  Plus,
  UploadCloud,
  Search,
  Mic
} from 'lucide-react';
import { motion } from 'framer-motion';

const publicGroupNames = ["സമാജം", "COMPASS", "EXCELLENTIA", "CLEANY ISHA'ATH", "MULTHAQA", "ആഴ്ചക്കൂട്ടം"];

const ChatGroupPage = ({ user }) => {
  const { toast } = useToast();

  const [groups, setGroups] = useState(loadData('chatGroups',
    publicGroupNames.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      members: ['all'],
      messages: [],
      isPublic: true
    }))
  ));

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [notepadContent, setNotepadContent] = useState(loadData('chatNotepad', ''));
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfilePhoto, setUserProfilePhoto] = useState(user.photo || null);

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const profilePhotoInputRef = useRef(null);

  useEffect(() => {
    saveData('chatGroups', groups);
  }, [groups]);

  useEffect(() => {
    saveData('chatNotepad', notepadContent);
  }, [notepadContent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedGroup?.messages]);

  const handleSendMessage = (type = 'text', content = newMessage) => {
    if (!selectedGroup || (!content.trim() && type === 'text')) return;

    const message = {
      id: Date.now().toString(),
      sender: user.name,
      type,
      text: type === 'text' ? content.trim() : '',
      content: type !== 'text' ? content : '',
      timestamp: new Date().toISOString(),
    };

    setGroups(prev =>
      prev.map(group =>
        group.id === selectedGroup.id
          ? { ...group, messages: [...group.messages, message] }
          : group
      )
    );

    if (type === 'text') setNewMessage('');
    toast({
      title: `Sent ${type}`,
      description: `Message sent`,
      className: "bg-blue-500 text-white"
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      handleSendMessage('image', fileUrl);
    } else if (fileType.startsWith('video/')) {
      handleSendMessage('video', fileUrl);
    } else if (fileType.startsWith('audio/')) {
      handleSendMessage('voice', fileUrl);
    } else {
      handleSendMessage('file', fileUrl);
    }

    e.target.value = null;
  };

  const handleDeleteMessage = (messageId) => {
    if (!selectedGroup) return;

    setGroups(prev =>
      prev.map(group =>
        group.id === selectedGroup.id
          ? {
              ...group,
              messages: group.messages.filter(msg => msg.id !== messageId)
            }
          : group
      )
    );

    toast({
      title: "Message deleted",
      className: "bg-red-500 text-white"
    });
  };

  const handleCreateGroup = () => {
    const name = prompt("Enter new group name:");
    if (!name) return;

    const newGroup = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      members: [user.name],
      messages: [],
      isPublic: false
    };

    setGroups(prev => [...prev, newGroup]);
    toast({
      title: "Group created",
      description: `Created "${name}"`,
      className: "bg-green-500 text-white"
    });
  };

  const handleProfilePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setUserProfilePhoto(fileUrl);
      toast({ title: "Profile Photo Updated!", className: "bg-green-500 text-white" });
    }
  };

  const handleStartRecording = async () => {
    if (recording) {
      // Stop recording
      mediaRecorderRef.current.stop();
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(blob);
          handleSendMessage('voice', audioUrl);
          setRecording(false);
        };
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Microphone permission denied.",
          className: "bg-red-500 text-white"
        });
      }
    }
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-3 border-b border-border bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="flex items-center gap-3">
          <Avatar>
            {userProfilePhoto ? (
              <AvatarImage src={userProfilePhoto} />
            ) : (
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <Button variant="outline" size="sm" onClick={() => profilePhotoInputRef.current.click()}>
            <UploadCloud className="mr-2 w-4 h-4" /> Upload Photo
          </Button>
          <Input
            ref={profilePhotoInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleProfilePhotoUpload}
          />

          <Button size="sm" onClick={handleCreateGroup}>
            <Plus className="mr-2 w-4 h-4" /> New Group
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <Search className="w-4 h-4" />
        </div>
      </div>

      {/* Main Layout */}
      <motion.div className="flex flex-1 overflow-hidden">
        {/* Group List */}
        <aside className="w-1/4 p-3 border-r border-border bg-white">
          <h2 className="font-bold mb-2">Groups</h2>
          <ScrollArea className="h-full">
            {filteredGroups.map(group => (
              <Button
                key={group.id}
                variant={selectedGroup?.id === group.id ? "secondary" : "ghost"}
                className="w-full justify-start mb-1"
                onClick={() => setSelectedGroup(group)}
              >
                {group.name}
              </Button>
            ))}
          </ScrollArea>
        </aside>

        {/* Chat or Notepad */}
        <main className="flex-1 flex flex-col p-3 bg-gray-50">
          {selectedGroup ? (
            <>
              <ScrollArea className="flex-grow mb-3">
                {selectedGroup.messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3"
                  >
                    <div className="relative p-2 rounded-md shadow bg-purple-600 text-white max-w-lg">
                      <p className="text-xs mb-1 font-bold">{msg.sender}</p>
                      {msg.type === 'text' && <p>{msg.text}</p>}
                      {msg.type === 'image' && <img src={msg.content} alt="sent" className="max-w-full rounded" />}
                      {msg.type === 'video' && <video controls src={msg.content} className="max-w-full rounded" />}
                      {msg.type === 'voice' && <audio controls src={msg.content} className="w-full" />}
                      {msg.type === 'file' && <a href={msg.content} download className="underline">Download File</a>}

                      <div className="flex justify-between items-center text-[10px] mt-1">
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        {msg.sender === user.name && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-2 p-1 text-white"
                            onClick={() => handleDeleteMessage(msg.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef}></div>
              </ScrollArea>

              <div className="flex items-center gap-2 border-t pt-2">
                <Button onClick={() => fileInputRef.current.click()}>
                  <Paperclip />
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={() => handleSendMessage()}>
                  <Send />
                </Button>
                <Button
                  onClick={handleStartRecording}
                  variant={recording ? "destructive" : "default"}
                >
                  <Mic className="w-4 h-4 mr-1" />
                  {recording ? "Stop" : "Record"}
                </Button>
              </div>
            </>
          ) : (
            <Card className="w-full h-full flex flex-col">
              <CardHeader>
                <CardTitle>🗒️ Your Notepad</CardTitle>
                <CardDescription>Write notes while you’re here.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <Textarea
                  className="w-full h-full"
                  value={notepadContent}
                  onChange={e => setNotepadContent(e.target.value)}
                  placeholder="Write your notes here..."
                />
              </CardContent>
            </Card>
          )}
        </main>
      </motion.div>
    </motion.div>
  );
};

export default ChatGroupPage;
