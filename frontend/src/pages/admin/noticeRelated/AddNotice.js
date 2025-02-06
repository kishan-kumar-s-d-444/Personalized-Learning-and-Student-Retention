import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress } from '@mui/material';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

const AddNotice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, response, error } = useSelector(state => state.user);
  const { currentUser } = useSelector(state => state.user);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const adminID = currentUser._id

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const fields = { title, details, date, adminID };
  const address = "Notice"

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true);
    dispatch(addStuff(fields, address));
  };

  useEffect(() => {
    if (status === 'added') {
      navigate('/Admin/notices');
      dispatch(underControl())
    } else if (status === 'error') {
      setMessage("Network Error")
      setShowPopup(true)
      setLoader(false)
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <>
      <RegisterContainer>
        <Form onSubmit={submitHandler}>
          <Title>Add Notice</Title>
          <Label>Title</Label>
          <Input
            type="text"
            placeholder="Enter notice title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
           <Label>Details</Label>
          <Input
            type="text"
            placeholder="Enter notice details..."
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            required
          />
           <Label>Date</Label>
          <Input
            type="date"
            placeholder="Enter notice date..."
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
           <Button type="submit" disabled={loader}>
            {loader ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Add'
            )}
          </Button>
        </Form>
      </RegisterContainer>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default AddNotice;

const RegisterContainer = styled.div`
 height: 100vh;
 display: flex;
 align-items: center;
 justify-content: center;
 background-color: #f5f5f5;
`;

const Form = styled.form`
 display: flex;
 flex-direction: column;
 padding: 2rem;
 background-color: white;
 border-radius: 10px;
 box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
 min-width: 300px;
 width: 100%;
 max-width: 500px;
`;

const Title = styled.span`
 font-size: 24px;
 font-weight: 600;
 color: #333;
 margin-bottom: 1.5rem;
 text-align: center;
`;
const Label = styled.label`
 margin: 10px 0;
 font-size: 16px;
 color: #555;
`;

const Input = styled.input`
 padding: 12px;
 margin-bottom: 15px;
 border: 1px solid #ddd;
 border-radius: 5px;
 font-size: 14px;
 transition: border-color 0.3s ease;
  &:focus {
   outline: none;
   border-color: #4a90e2;
 }
`;

const Button = styled.button`
 margin-top: 15px;
 padding: 12px;
 background-color: #4a90e2;
 color: white;
 border: none;
 border-radius: 5px;
 cursor: pointer;
 font-size: 16px;
 transition: background-color 0.3s ease;
  &:hover {
   background-color: #357abd;
 }
  &:disabled {
   background-color: #cccccc;
   cursor: not-allowed;
 }
`;