import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f6f9;
    line-height: 1.6;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background: #f8fafc;
  margin-top: 64px;
  position: fixed;
  top: 0;
  left: 240px;
  right: 0;
  bottom: 0;
  z-index: 100;
`;

const ChatContainer = styled.div`
  flex-grow: 1;
  background-color: white;
  border-radius: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: 0 20px;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: #ffffff;
  margin: 0 auto;
  width: 100%;
  max-width: 900px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
    
    &:hover {
      background: #94a3b8;
    }
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 1rem;
  ${props => props.isAI ? 'margin-right: auto;' : 'margin-left: auto; flex-direction: row-reverse;'}
  max-width: ${props => props.isAI ? '90%' : '70%'};
  min-width: 200px;
`;

const Avatar = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isAI ? '#7c3aed' : '#0ea5e9'};
  color: white;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MessageContent = styled.div`
  padding: 1rem 1.2rem;
  border-radius: 15px;
  background-color: ${props => props.isAI ? '#f8fafc' : '#0ea5e9'};
  color: ${props => props.isAI ? '#1e293b' : '#fff'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-size: 0.95rem;
  line-height: 1.6;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 15px;
    ${props => props.isAI ? 'left: -8px; border-right: 8px solid #f8fafc;' : 'right: -8px; border-left: 8px solid #0ea5e9;'}
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }

  ${props => props.isAI && `
    border: 1px solid #e2e8f0;
    
    /* Markdown Styles */
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
      color: #1e293b;
    }

    p {
      margin: 0.5em 0;
      color: #334155;
    }

    ul, ol {
      margin: 0.5em 0;
      padding-left: 1.5em;
      color: #334155;
    }

    li {
      margin: 0.3em 0;
    }

    code {
      background-color: #f1f5f9;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
      color: #0f172a;
    }

    pre {
      background-color: #f1f5f9;
      padding: 1em;
      border-radius: 8px;
      overflow-x: auto;
      margin: 0.8em 0;
      border: 1px solid #e2e8f0;

      code {
        background-color: transparent;
        padding: 0;
        color: #0f172a;
      }
    }

    blockquote {
      border-left: 4px solid #e2e8f0;
      margin: 0.8em 0;
      padding: 0.5em 1em;
      color: #64748b;
      background-color: #f8fafc;
      border-radius: 0 4px 4px 0;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      font-size: 0.9em;
    }

    th, td {
      border: 1px solid #e2e8f0;
      padding: 0.75em;
      text-align: left;
    }

    th {
      background-color: #f1f5f9;
      font-weight: 600;
      color: #1e293b;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 0.8em 0;
    }

    a {
      color: #2563eb;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  `}
`;

const InputContainer = styled.div`
  padding: 1.2rem;
  background-color: white;
  border-top: 1px solid #e2e8f0;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 0.8rem;
  position: relative;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 0.9rem 1.2rem;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  color: #1e293b;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }

  &:disabled {
    background-color: #f1f5f9;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  padding: 0.9rem 1.8rem;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;

  &:hover {
    background-color: #6d28d9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #cbd5e1;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 1rem;
  }
`;

const LoadingSpinner = styled(FontAwesomeIcon)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Query = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const genAI = new GoogleGenerativeAI('AIzaSyAiZfQSaiEkCk7J_A22iwPY0S3BgmbO7uk');

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isAI: false }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const aiMessage = response.text();

      setMessages(prev => [...prev, { text: aiMessage, isAI: true }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I encountered an error. Please try again.", 
        isAI: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <ChatContainer>
          <MessagesContainer>
            {messages.map((message, index) => (
              <MessageWrapper key={index} isAI={message.isAI}>
                <Avatar isAI={message.isAI}>
                  <FontAwesomeIcon icon={message.isAI ? faRobot : faUser} />
                </Avatar>
                <MessageContent isAI={message.isAI}>
                  {message.isAI ? (
                    <ReactMarkdown>
                      {message.text}
                    </ReactMarkdown>
                  ) : (
                    message.text
                  )}
                </MessageContent>
              </MessageWrapper>
            ))}
            <div ref={messagesEndRef} />
          </MessagesContainer>
          <InputContainer>
            <InputWrapper>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your question..."
                disabled={isLoading}
              />
              <SendButton onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <>
                    <LoadingSpinner icon={faSpinner} />
                    Thinking...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Send
                  </>
                )}
              </SendButton>
            </InputWrapper>
          </InputContainer>
        </ChatContainer>
      </Container>
    </>
  );
};

export default Query;
