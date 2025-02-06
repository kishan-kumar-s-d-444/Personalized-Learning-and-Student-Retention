import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
`;

const InputContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const AssignmentList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const AssignmentItem = styled.li`
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Assign = () => {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState('');
  const [dueDate, setDueDate] = useState('');

  const addAssignment = () => {
    if (newAssignment.trim()) {
      const assignment = {
        id: Date.now(),
        text: newAssignment,
        dueDate: dueDate,
        completed: false
      };
      setAssignments([...assignments, assignment]);
      setNewAssignment('');
      setDueDate('');
    }
  };

  const deleteAssignment = (id) => {
    setAssignments(assignments.filter(assignment => assignment.id !== id));
  };

  const toggleComplete = (id) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === id 
        ? { ...assignment, completed: !assignment.completed } 
        : assignment
    ));
  };

  return (
    <Container>
      <Title>Assignments</Title>
      <InputContainer>
        <Input 
          type="text" 
          value={newAssignment}
          onChange={(e) => setNewAssignment(e.target.value)}
          placeholder="Enter new assignment"
        />
        <Input 
          type="date" 
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <Button onClick={addAssignment}>Add Assignment</Button>
      </InputContainer>
      <AssignmentList>
        {assignments.map((assignment) => (
          <AssignmentItem key={assignment.id}>
            <div style={{ 
              textDecoration: assignment.completed ? 'line-through' : 'none',
              flexGrow: 1
            }}>
              {assignment.text}
              {assignment.dueDate && (
                <span style={{ 
                  marginLeft: '10px', 
                  color: '#666', 
                  fontSize: '0.8em' 
                }}>
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <ActionButtons>
              <Button 
                onClick={() => toggleComplete(assignment.id)}
                style={{ 
                  backgroundColor: assignment.completed ? '#6c757d' : '#28a745',
                  padding: '5px 10px',
                  fontSize: '0.8em'
                }}
              >
                {assignment.completed ? 'Undo' : 'Complete'}
              </Button>
              <Button 
                onClick={() => deleteAssignment(assignment.id)}
                style={{ 
                  backgroundColor: '#dc3545',
                  padding: '5px 10px',
                  fontSize: '0.8em'
                }}
              >
                Delete
              </Button>
            </ActionButtons>
          </AssignmentItem>
        ))}
      </AssignmentList>
    </Container>
  );
};

export default Assign;
