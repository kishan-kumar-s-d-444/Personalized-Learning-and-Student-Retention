import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';
import { Container, Box } from '@mui/material';
import io from 'socket.io-client';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSmile, faPaperPlane, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

const MainContainer = styled.div`
  padding: 0;
  background-color: #FFF;
  box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
  height: calc(100vh - 64px); 
  display: flex;
  margin: 0;
  overflow: hidden;
  border-radius: 0;
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
`;

const StudentList = styled.section`
  width: 35%;
  height: 100%;
  box-shadow: 0px 8px 10px rgba(0,0,0,0.20);
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
`;

const SearchSection = styled.div`
  width: 100%;
  height: 90px;
  background-color: #FAFAFA;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E0E0E0;
  flex-shrink: 0;
`;

const StudentListContent = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: #FFFFFF;
`;

const ChatSection = styled.section`
  width: calc(65% - 85px);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  background-color: #FFF;
  height: 90px;
  box-shadow: 0px 3px 2px rgba(0,0,0,0.100);
  display: flex;
  align-items: center;
  padding: 0 30px;
  flex-shrink: 0;

  .name {
    margin: 0 0 0 20px;
    text-transform: uppercase;
    font-family: 'Montserrat', sans-serif;
    font-size: 13pt;
    color: #515151;
  }

  .icon {
    color: #515151;
    font-size: 14pt;
  }

  .right {
    margin-left: auto;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 25px 35px;
  overflow-y: auto;
`;

const ChatFooter = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  border-top: 2px solid #EEE;
  padding: 0 30px;
  background-color: #FFF;
  flex-shrink: 0;

  .icon {
    color: #C0C0C0;
    font-size: 25pt;
    cursor: pointer;
  }

  .send {
    color: #fff;
    background-color: #4f6ebd;
    padding: 12px;
    border-radius: 50px;
    margin-left: auto;
    cursor: pointer;
  }

  input {
    border: none;
    width: 60%;
    height: 50px;
    margin-left: 20px;
    padding: 10px;
    font-size: 13pt;
    &::placeholder {
      color: #C0C0C0;
    }
  }
`;

const SearchBar = styled.div`
  height: 40px;
  background-color: #FFF;
  width: 70%;
  padding: 0 20px;
  border-radius: 50px;
  border: 1px solid #EEEEEE;
  display: flex;
  align-items: center;
  cursor: pointer;

  input {
    margin-left: 15px;
    height: 38px;
    width: 100%;
    border: none;
    font-family: 'Montserrat', sans-serif;
    &::placeholder {
      color: #E0E0E0;
    }
  }
`;

const StudentItem = styled.div`
  width: 100%;
  height: 90px;
  background-color: ${props => props.active ? '#FFF' : '#FAFAFA'};
  border-bottom: solid 1px #E0E0E0;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 20px;
`;

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ')
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
};

const getAvatarColor = (name) => {
  if (!name) return '#E6E7ED';
  const colors = [
    '#87a3ec', // Blue
    '#8BC34A', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#F44336', // Red
    '#2196F3', // Light Blue
    '#4CAF50', // Green
    '#FF5722'  // Deep Orange
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Avatar = styled.div`
  width: 45px;
  height: 45px;
  background: ${props => getAvatarColor(props.name)};
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  position: relative;
`;

const OnlineBadge = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 13px;
  height: 13px;
  background-color: #8BC34A;
  border-radius: 50%;
  border: 2px solid white;
`;

const StudentInfo = styled.div`
  margin-left: 20px;
  flex: 1;

  .name {
    font-family: 'Montserrat', sans-serif;
    font-size: 11pt;
    color: #515151;
    margin: 0;
  }

  .message {
    font-family: 'Montserrat', sans-serif;
    font-size: 9pt;
    color: #515151;
    margin: 6px 0 0 0;
  }
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  flex-direction: ${props => props.isOwn ? 'row-reverse' : 'row'};
  gap: 10px;
`;

const MessageAvatar = styled.div`
  align-self: flex-end;
  margin-bottom: 10px;
`;

const MessageText = styled.div`
  margin: 0;
  background-color: ${props => props.isOwn ? '#e3effd' : '#f6f6f6'};
  padding: 15px;
  border-radius: 12px;
  max-width: 70%;
`;

const TimeStamp = styled.div`
  font-size: 10px;
  color: lightgrey;
  margin: 0 0 10px ${props => props.isOwn ? '0' : '55px'};
  text-align: ${props => props.isOwn ? 'right' : 'left'};
`;

const TeacherDoubt = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { sclassStudents: students, loading, error } = useSelector((state) => state.sclass);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [socket, setSocket] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem(`teacherMessages_${currentUser?._id}`);
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [messageInput, setMessageInput] = useState('');
    const messageListRef = useRef(null);

    const formatTimestamp = (timestamp) => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                return '';
            }
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return '';
        }
    };

    useEffect(() => {
        if (currentUser?.teachSclass?._id) {
            dispatch(getClassStudents(currentUser.teachSclass._id));
        }
        const newSocket = io(process.env.REACT_APP_BASE_URL);
        setSocket(newSocket);
        newSocket.emit('join_room', currentUser._id);

        // Listen for incoming messages
        newSocket.on('receive_message', (message) => {
            console.log('Received message:', message);
            const isRelevantMessage = 
                message.receiverId === currentUser._id || 
                message.senderId === currentUser._id;

            if (isRelevantMessage) {
                setMessages(prevMessages => {
                    // Use a more robust duplicate check with a unique identifier
                    const isDuplicate = prevMessages.some(
                        msg => msg.timestamp === message.timestamp && 
                               msg.senderId === message.senderId && 
                               msg.text === message.text &&
                               msg.receiverId === message.receiverId
                    );
                    return isDuplicate ? prevMessages : [...prevMessages, message];
                });
            }
        });

        return () => {
            newSocket.disconnect();
            newSocket.off('receive_message');
        };
    }, [currentUser, dispatch]);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (currentUser?._id) {
            localStorage.setItem(`teacherMessages_${currentUser._id}`, JSON.stringify(messages));
        }
    }, [messages, currentUser]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
    };

    const sendMessage = () => {
        if (!messageInput.trim() || !selectedStudent) return;

        const messageData = {
            senderId: currentUser._id,
            senderName: currentUser.name,
            receiverId: selectedStudent._id,
            text: messageInput.trim(),
            senderType: 'teacher',
            senderClass: selectedStudent.sclassName._id,
            receiverClass: selectedStudent.sclassName._id,
            timestamp: new Date().toISOString(),
            clientId: Date.now()
        };

        // Clear input immediately for better UX
        const currentInput = messageInput;
        setMessageInput('');

        socket.emit('send_message', messageData, (serverResponse) => {
            if (serverResponse && serverResponse.status === 'success') {
                setMessages(prev => {
                    const isDuplicate = prev.some(msg => msg.clientId === messageData.clientId);
                    return isDuplicate ? prev : [...prev, messageData];
                });
            } else {
                // Restore input if message failed to send
                setMessageInput(currentInput);
            }
        });
    };

    // Filter messages for selected student
    const filteredMessages = messages.filter(msg => 
        (msg.receiverId === selectedStudent?._id && msg.senderId === currentUser._id) ||
        (msg.senderId === selectedStudent?._id && msg.receiverId === currentUser._id)
    );

    // Filter students based on search term
    const filteredStudents = students?.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainContainer>
            <StudentList>
                <SearchSection>
                    <SearchBar>
                        <FontAwesomeIcon icon={faSearch} />
                        <input 
                            type="text" 
                            placeholder="Search students..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchBar>
                </SearchSection>
                <StudentListContent>
                    {filteredStudents?.map((student) => (
                        <StudentItem 
                            key={student._id} 
                            active={selectedStudent?._id === student._id}
                            onClick={() => handleStudentSelect(student)}
                        >
                            <Avatar name={student.name}>
                                {getInitials(student.name)}
                                <OnlineBadge />
                            </Avatar>
                            <StudentInfo>
                                <p className="name">{student.name}</p>
                                <p className="message">Click to start chatting</p>
                            </StudentInfo>
                        </StudentItem>
                    ))}
                </StudentListContent>
            </StudentList>

            <ChatSection>
                {selectedStudent ? (
                    <>
                        <ChatHeader>
                            <Avatar name={selectedStudent.name}>
                                {getInitials(selectedStudent.name)}
                            </Avatar>
                            <span className="name">{selectedStudent.name}</span>
                            <FontAwesomeIcon icon={faEllipsisH} className="icon right" />
                        </ChatHeader>
                        <ChatMessages ref={messageListRef}>
                            {filteredMessages.map((msg, index) => (
                                <React.Fragment key={index}>
                                    <Message isOwn={msg.senderId === currentUser._id}>
                                        {msg.senderId === currentUser._id ? (
                                            <MessageAvatar>
                                                <Avatar name={currentUser.name}>
                                                    {getInitials(currentUser.name)}
                                                </Avatar>
                                            </MessageAvatar>
                                        ) : (
                                            <MessageAvatar>
                                                <Avatar name={selectedStudent.name}>
                                                    {getInitials(selectedStudent.name)}
                                                </Avatar>
                                            </MessageAvatar>
                                        )}
                                        <MessageText isOwn={msg.senderId === currentUser._id}>
                                            {msg.text}
                                        </MessageText>
                                    </Message>
                                    <TimeStamp isOwn={msg.senderId === currentUser._id}>
                                        {formatTimestamp(msg.timestamp)}
                                    </TimeStamp>
                                </React.Fragment>
                            ))}
                        </ChatMessages>
                        <ChatFooter>
                            <FontAwesomeIcon icon={faSmile} className="icon" />
                            <input
                                type="text"
                                placeholder="Type your message here"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <FontAwesomeIcon 
                                icon={faPaperPlane} 
                                className="icon send"
                                onClick={sendMessage}
                            />
                        </ChatFooter>
                    </>
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        color: '#515151'
                    }}>
                        Select a student to start chatting
                    </Box>
                )}
            </ChatSection>
        </MainContainer>
    );
};

export default TeacherDoubt;
