import { useEffect, useState } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, ButtonGroup, Button, Popper, Grow, ClickAwayListener, MenuList, MenuItem } from '@mui/material';
import { BlackButton, BlueButton} from "../../components/buttonStyles";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
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

const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);

    const { currentUser } = useSelector((state) => state.user);
    const classID = currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id

    const [filterText, setFilterText] = useState("");
    const [filteredStudents, setFilteredStudents] = useState([]);

    useEffect(() => {
        dispatch(getClassStudents(classID));
    }, [dispatch, classID])

    useEffect(() => {
        if (sclassStudents) {
            setFilteredStudents(sclassStudents.filter(student =>
                student.name.toLowerCase().includes(filterText.toLowerCase()) ||
                student.rollNum.toString().includes(filterText)
            ));
        }
    }, [filterText, sclassStudents]);

    if (error) {
        console.log(error)
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    const studentRows = filteredStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    })

    const StudentsButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks']

        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        const handleClick = () => {
            if (selectedIndex === 0) {
                handleAttendance();
            } else if (selectedIndex === 1) {
                handleMarks();
            }
        };

        const handleAttendance = () => {
            navigate(`/Teacher/class/student/attendance/${row.id}/${subjectID}`)
        }
        const handleMarks = () => {
            navigate(`/Teacher/class/student/marks/${row.id}/${subjectID}`)
        };

        const handleMenuItemClick = (event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };

        const handleToggle = () => {
            setOpen((prevOpen) => !prevOpen);
        };

        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) {
                return;
            }
            setOpen(false);
        };

        return (
            <ActionButtons>
                <BlueButton
                    variant="contained"
                    onClick={() => navigate("/Teacher/class/student/" + row.id)}
                >
                    View
                </BlueButton>
                {/* <ButtonGroup variant="contained" ref={anchorRef}>
                    <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                    <BlackButton size="small" onClick={handleToggle}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </BlackButton>
                </ButtonGroup> */}
                <Popper
                    open={open}
                    anchorEl={anchorRef.current}
                    transition
                    disablePortal
                    style={{ zIndex: 1 }}
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu">
                                        {options.map((option, index) => (
                                            <MenuItem
                                                key={option}
                                                selected={index === selectedIndex}
                                                onClick={(event) => handleMenuItemClick(event, index)}
                                            >
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </ActionButtons>
        );
    };

    return (
        <Container>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <HeaderContainer>
                        <Title>Class Details</Title>
                    </HeaderContainer>

                    <FilterBar>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter Students:
                        </label>
                        <FilterInput
                            type="text"
                            placeholder="Search by name or roll number..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </FilterBar>

                    <TableContainer>
                        <TableHeader>
                            {studentColumns.map((column) => (
                                <TableCell key={column.id}>{column.label}</TableCell>
                            ))}
                            <TableCell center>Actions</TableCell>
                        </TableHeader>

                        <TableBody>
                            {studentRows.map((row, index) => (
                                <TableRow key={row.id} isEven={index % 2 === 0}>
                                    {Object.keys(row).filter(key => key !== 'id').map((key) => (
                                        <TableCell key={key}>{row[key]}</TableCell>
                                    ))}
                                    <TableCell center>
                                        <StudentsButtonHaver row={row} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableContainer>
                </>
            )}
        </Container>
    );
};

export default TeacherClassDetails;