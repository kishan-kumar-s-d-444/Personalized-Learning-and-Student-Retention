import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { CircularProgress } from '@mui/material';
import styled from 'styled-components';
const AddStudent = ({ situation }) => {
        const dispatch = useDispatch()
        const navigate = useNavigate()
        const params = useParams()

        const userState = useSelector(state => state.user);
        const { status, currentUser, response, error } = userState;
        const { sclassesList } = useSelector((state) => state.sclass);

        const [name, setName] = useState('');
        const [rollNum, setRollNum] = useState('');
        const [password, setPassword] = useState('')
        const [className, setClassName] = useState('')
        const [sclassName, setSclassName] = useState('')

        const adminID = currentUser._id
        const role = "Student"
        const attendance = []

        useEffect(() => {
            if (situation === "Class") {
                setSclassName(params.id);
            }
        }, [params.id, situation]);

        const [showPopup, setShowPopup] = useState(false);
        const [message, setMessage] = useState("");
        const [loader, setLoader] = useState(false)

        useEffect(() => {
            dispatch(getAllSclasses(adminID, "Sclass"));
        }, [adminID, dispatch]);

        const changeHandler = (event) => {
            if (event.target.value === 'Select Class') {
                setClassName('Select Class');
                setSclassName('');
            } else {
                const selectedClass = sclassesList.find(
                    (classItem) => classItem.sclassName === event.target.value
                );
                setClassName(selectedClass.sclassName);
                setSclassName(selectedClass._id);
            }
        }

        const fields = { name, rollNum, password, sclassName, adminID, role, attendance }

        const submitHandler = (event) => {
            event.preventDefault()
            if (sclassName === "") {
                setMessage("Please select a classname")
                setShowPopup(true)
            }
            else {
                setLoader(true)
                dispatch(registerUser(fields, role))
            }
        }

        useEffect(() => {
            if (status === 'added') {
                dispatch(underControl())
                navigate(-1)
            }
            else if (status === 'failed') {
                setMessage(response)
                setShowPopup(true)
                setLoader(false)
            }
            else if (status === 'error') {
                setMessage("Network Error")
                setShowPopup(true)
                setLoader(false)
            }
        }, [status, navigate, error, response, dispatch]);

    return (
        <>
            <RegisterContainer>
           <Form onSubmit={submitHandler}>
               <Title>Add Student</Title>
               <div>
                   <Label>Name</Label>
                   <Input type="text" placeholder="Enter student's name..."
                       value={name}
                       onChange={(event) => setName(event.target.value)}
                       autoComplete="name" required />
               </div>
               {situation === "Student" && (
                   <div>
                       <Label>Class</Label>
                       <Input as="select"
                           value={className}
                           onChange={changeHandler} required>
                           <option value='Select Class'>Select Class</option>
                           {sclassesList.map((classItem, index) => (
                               <option key={index} value={classItem.sclassName}>
                                   {classItem.sclassName}
                               </option>
                           ))}
                       </Input>
                   </div>
               )}
               <div>
                   <Label>Roll Number</Label>
                   <Input type="number" placeholder="Enter student's Roll Number..."
                       value={rollNum}
                       onChange={(event) => setRollNum(event.target.value)}
                       required />
               </div>
               <div>
                   <Label>Password</Label>
                   <Input type="password" placeholder="Enter student's password..."
                       value={password}
                       onChange={(event) => setPassword(event.target.value)}
                       autoComplete="new-password" required />
               </div>
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
    )
}

export default AddStudent

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
   display: block;
   margin-bottom: 8px;
   font-size: 16px;
   color: #555;
`;
const Input = styled.input`
   display: block;
   width: 100%;
   padding: 12px;
   margin-bottom: 20px;
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