import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress } from '@mui/material';
import styled from 'styled-components';

const AddTeacher = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const subjectID = params.id
  console.log(subjectID)

  const { status, response, error } = useSelector(state => state.user);
  const { currentUser } = useSelector((state) => state.user);
  const { subjectDetails } = useSelector((state) => state.sclass);

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
  }, [dispatch, subjectID]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false)

  const role = "Teacher"
  // Prioritize school from subjectDetails, fallback to currentUser's school
  const school = (subjectDetails && subjectDetails.school) || 
                (currentUser && currentUser.school) || 
                null;
  const teachSubject = subjectDetails && subjectDetails._id
  const teachSclass = subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName._id

  const fields = { name, email, password, role, school, teachSubject, teachSclass }

  const submitHandler = (event) => {
    event.preventDefault()
    setLoader(true)
    if (!school) {
      setMessage("School information is missing. Please contact administrator.");
      setShowPopup(true);
      setLoader(false);
      return;
    }
    dispatch(registerUser(fields, role))
  }

  useEffect(() => {
    if (status === 'added') {
      dispatch(underControl())
      navigate("/Admin/teachers")
    }
    else if (status === 'failed') {
      setMessage(response)
      setShowPopup(true)
      setLoader(false)
      console.error('Teacher Registration Failed:', response);  
    }
    else if (status === 'error') {
      setMessage("Network Error or Server Issue")
      setShowPopup(true)
      setLoader(false)
      console.error('Teacher Registration Error:', error);  
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <RegisterContainer>
      <Form onSubmit={submitHandler}>
        <Title>Add Teacher</Title>
        {subjectDetails && (
          <>
            <Label>
              Subject: {subjectDetails.subName || 'Not Specified'}
            </Label>
            <Label>
              Class: {subjectDetails.sclassName && subjectDetails.sclassName.sclassName 
                      ? subjectDetails.sclassName.sclassName 
                      : 'Not Specified'}
            </Label>
            {!school && (
              <ErrorLabel>Warning: School information not found</ErrorLabel>
            )}
          </>
        )}
        <Label>Name</Label>
        <Input
          type="text"
          placeholder="Enter teacher's name..."
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
         <Label>Email</Label>
        <Input
          type="email"
          placeholder="Enter teacher's email..."
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
         <Label>Password</Label>
        <Input
          type="password"
          placeholder="Enter teacher's password..."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
         <Button type="submit" disabled={loader}>
          {loader ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Register'
          )}
        </Button>
      </Form>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </RegisterContainer>
  )
}

export default AddTeacher

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
const ErrorLabel = styled(Label)`
 color: red;
 font-weight: bold;
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