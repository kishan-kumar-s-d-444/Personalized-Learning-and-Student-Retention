import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { Box, Button, ButtonGroup, ClickAwayListener, Grow, Paper, Popper, MenuItem, MenuList } from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1142px;
  margin: 0 auto;
  padding: 32px 16px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a237e;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  gap: 16px;
  align-items: center;
  background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  padding: 16px;
`;

const TableCell = styled.div`
  padding: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: ${props => props.center ? 'center' : 'flex-start'};
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(224, 224, 224, 0.4);
  background: ${props => props.isEven ? 'rgba(0, 0, 0, 0.02)' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    background: rgba(33, 150, 243, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const FilterBar = styled.div`
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  }
`;

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    const [showFilters, setShowFilters] = useState(false);
    const [filterText, setFilterText] = useState("");
    const [filteredStudents, setFilteredStudents] = useState([]);

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        if (studentsList) {
            setFilteredStudents(studentsList.filter(student =>
                student.name.toLowerCase().includes(filterText.toLowerCase()) ||
                student.rollNum.toString().includes(filterText) ||
                student.sclassName.sclassName.toLowerCase().includes(filterText.toLowerCase())
            ));
        }
    }, [filterText, studentsList]);

    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllStudents(currentUser._id));
            });
    };

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />,
            name: 'Add New Student',
            action: () => navigate("/Admin/addstudents")
        },
        {
            icon: <PersonRemoveIcon color="error" />,
            name: 'Delete All Students',
            action: () => deleteHandler(currentUser._id, "Students")
        },
    ];

    return (
        <Container>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <HeaderContainer>
                        <Title>Students List</Title>
                        <ButtonContainer>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                            <GreenButton
                                variant="contained"
                                onClick={() => navigate("/Admin/addstudents")}
                            >
                                Add Student
                            </GreenButton>
                        </ButtonContainer>
                    </HeaderContainer>

                    {showFilters && (
                        <FilterBar>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter Students:
                            </label>
                            <FilterInput
                                type="text"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Search by name, roll number, or class..."
                            />
                        </FilterBar>
                    )}

                    <TableContainer>
                        <TableHeader>
                            <TableCell>Name</TableCell>
                            <TableCell>Roll Number</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell center>Actions</TableCell>
                        </TableHeader>

                        <TableBody>
                            {filteredStudents.map((student, index) => (
                                <TableRow key={student._id} isEven={index % 2 === 0}>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.rollNum}</TableCell>
                                    <TableCell>{student.sclassName.sclassName}</TableCell>
                                    <TableCell>
                                        <ActionButtons>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => navigate(`/Admin/students/student/${student._id}`)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => deleteHandler(student._id, "Student")}
                                            >
                                                Delete
                                            </Button>
                                        </ActionButtons>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableContainer>

                    <SpeedDialTemplate actions={actions} />
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ShowStudents;