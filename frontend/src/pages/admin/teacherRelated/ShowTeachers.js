import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import styled from 'styled-components';
import { Button } from '@mui/material';
import Popup from '../../../components/Popup';

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
  grid-template-columns: 2fr 1fr 2fr;
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
  grid-template-columns: 2fr 1fr 2fr;
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
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const ShowTeachers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
    const { currentUser, adminDetails } = useSelector(state => state.user);

    const [showFilters, setShowFilters] = useState(false);
    const [filterText, setFilterText] = useState("");
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [row, setRow] = useState({});

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        if (teachersList) {
            setFilteredTeachers(teachersList.filter(teacher =>
                teacher.name.toLowerCase().includes(filterText.toLowerCase()) ||
                (teacher.teachSubject?.subName || '').toLowerCase().includes(filterText.toLowerCase())
            ));
        }
    }, [filterText, teachersList]);

    const deleteHandler = async (id) => {
        const response = await dispatch(deleteUser(id));
        if (response?.payload?.success) {
            setMessage("Teacher deleted successfully");
            setShowPopup(true);
            dispatch(getAllTeachers(currentUser._id));
        }
    };

    const handleAddTeacher = () => {
        navigate("/Admin/teachers/chooseclass");
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'teachSubject', label: 'Subject', minWidth: 100 },
        { id: 'teachSclass', label: 'Class', minWidth: 170 },
    ];

    const rows = teachersList.map((teacher) => {
        return {
            name: teacher.name,
            teachSubject: teacher.teachSubject?.subName || null,
            teachSclass: teacher.teachSclass.sclassName,
            teachSclassID: teacher.teachSclass._id,
            id: teacher._id,
        };
    });

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, 
            name: 'Add New Teacher',
            action: handleAddTeacher
        },
        {
            icon: <PersonRemoveIcon color="error" />, 
            name: 'Delete All Teachers',
            action: () => {
                setMessage("Are you sure you want to delete all teachers?");
                setShowPopup(true);
            }
        },
    ];

    return (
        <Container>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <HeaderContainer>
                        <Title>Teachers List</Title>
                        <ButtonContainer>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleAddTeacher}
                            >
                                Add Teacher
                            </Button>
                        </ButtonContainer>
                    </HeaderContainer>

                    {showFilters && (
                        <FilterBar>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter Teachers:
                            </label>
                            <FilterInput
                                type="text"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Search by name or subject..."
                            />
                        </FilterBar>
                    )}

                    <TableContainer>
                        <TableHeader>
                            <TableCell>Name</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell center>Actions</TableCell>
                        </TableHeader>

                        <TableBody>
                            {filteredTeachers.map((teacher, index) => (
                                <TableRow key={teacher._id} isEven={index % 2 === 0}>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>{teacher.teachSubject?.subName || 'Not Assigned'}</TableCell>
                                    <TableCell align="right">
                                        <ActionButtons>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => navigate(`/Admin/teachers/teacher/${teacher._id}`)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => {
                                                    setRow(teacher);
                                                    setMessage(`Are you sure you want to delete ${teacher.name}?`);
                                                    setShowPopup(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </ActionButtons>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </TableContainer>
                </>
            )}
            <Popup 
                message={message} 
                setShowPopup={setShowPopup} 
                showPopup={showPopup}
                handleFunction={message.includes("delete") ? () => deleteHandler(row._id) : handleAddTeacher}
            />
        </Container>
    );
};

export default ShowTeachers;