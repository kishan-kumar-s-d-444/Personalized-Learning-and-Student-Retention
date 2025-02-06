import React, { useEffect, useState } from 'react'
import { getClassStudents, getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Tab, Container, Typography, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { BlueButton, GreenButton, PurpleButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import styled from 'styled-components';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';

const ViewSubject = () => {
  const navigate = useNavigate()
  const params = useParams()
  const dispatch = useDispatch();
  const { subloading, subjectDetails, sclassStudents, getresponse, error } = useSelector((state) => state.sclass);
  const { classID, subjectID } = params

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  if (error) {
    console.log(error)
  }

  const [value, setValue] = useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [selectedSection, setSelectedSection] = useState('attendance');
  const handleSectionChange = (event, newSection) => {
    setSelectedSection(newSection);
  };

  const studentColumns = [
    { id: 'rollNum', label: 'Roll No.', minWidth: 100 },
    { id: 'name', label: 'Name', minWidth: 170 },
  ]

  const studentRows = sclassStudents.map((student) => {
    return {
      rollNum: student.rollNum,
      name: student.name,
      id: student._id,
    };
  })

  const StudentsAttendanceButtonHaver = ({ row }) => {
    return (
      <ButtonContainer>
        <BlueButton
          variant="contained"
          onClick={() => navigate("/Admin/students/student/" + row.id)}
        >
          View
        </BlueButton>
        <PurpleButton
          variant="contained"
          onClick={() =>
            navigate(`/Admin/subject/student/attendance/${row.id}/${subjectID}`)
          }
        >
          Take Attendance
        </PurpleButton>
      </ButtonContainer>
    );
  }
   const StudentsMarksButtonHaver = ({ row }) => {
    return (
      <ButtonContainer>
        <BlueButton
          variant="contained"
          onClick={() => navigate("/Admin/students/student/" + row.id)}
        >
          View
        </BlueButton>
        <PurpleButton 
          variant="contained"
          onClick={() => navigate(`/Admin/subject/student/marks/${row.id}/${subjectID}`)}
        >
          Provide Marks
        </PurpleButton>
      </ButtonContainer>
    );
  }
  const SubjectStudentsSection = () => {
    return (
      <>
        {getresponse ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <GreenButton
                variant="contained"
                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
              >
                Add Students
              </GreenButton>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              Students List:
            </Typography>

            {selectedSection === 'attendance' &&
              <TableTemplate buttonHaver={StudentsAttendanceButtonHaver} columns={studentColumns} rows={studentRows} />
            }
            {selectedSection === 'marks' &&
              <TableTemplate buttonHaver={StudentsMarksButtonHaver} columns={studentColumns} rows={studentRows} />
            }

            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
              <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                <BottomNavigationAction
                  label="Attendance"
                  value="attendance"
                  icon={selectedSection === 'attendance' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                />
                <BottomNavigationAction
                  label="Marks"
                  value="marks"
                  icon={selectedSection === 'marks' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                />
              </BottomNavigation>
            </Paper>

          </>
        )}
      </>
    )
  }

  const SubjectDetailsSection = () => {
    const numberOfStudents = sclassStudents.length;
    const animatedStudentCount = useAnimatedNumber(numberOfStudents);
    const animatedSessionCount = useAnimatedNumber(subjectDetails?.sessions || 0);

    return (
      <>
        <SubjectHeader>
          <SubjectHeaderDetail>
            <ClassIcon />
            <SubjectHeaderText>
              <SubjectHeaderLabel>Subject Name</SubjectHeaderLabel>
              <SubjectHeaderValue>
                {subjectDetails && subjectDetails.subName}
              </SubjectHeaderValue>
            </SubjectHeaderText>
          </SubjectHeaderDetail>

          <SubjectHeaderDetail>
            <SchoolIcon />
            <SubjectHeaderText>
              <SubjectHeaderLabel>Subject Code</SubjectHeaderLabel>
              <SubjectHeaderValue>
                {subjectDetails && subjectDetails.subCode}
              </SubjectHeaderValue>
            </SubjectHeaderText>
          </SubjectHeaderDetail>

          <SubjectHeaderDetail>
            <PersonIcon />
            <SubjectHeaderText>
              <SubjectHeaderLabel>Teacher Name</SubjectHeaderLabel>
              <SubjectHeaderValue>
                {subjectDetails && subjectDetails.teacher 
                  ? subjectDetails.teacher.name 
                  : 'No Teacher Assigned'}
              </SubjectHeaderValue>
            </SubjectHeaderText>
          </SubjectHeaderDetail>

          <SubjectHeaderDetail>
            <ClassIcon />
            <SubjectHeaderText>
              <SubjectHeaderLabel>Class Name</SubjectHeaderLabel>
              <SubjectHeaderValue>
                {subjectDetails && subjectDetails.sclassName 
                  ? subjectDetails.sclassName.sclassName 
                  : 'No Class Assigned'}
              </SubjectHeaderValue>
            </SubjectHeaderText>
          </SubjectHeaderDetail>
        </SubjectHeader>

        <SubjectStatsContainer>
          <SubjectStatCard>
            <StatIconContainer>
              <GroupsIcon />
            </StatIconContainer>
            <StatDetails>
              <StatLabel>Number of Students</StatLabel>
              <StatValue>{animatedStudentCount}</StatValue>
            </StatDetails>
          </SubjectStatCard>

          <SubjectStatCard>
            <StatIconContainer>
              <SchoolIcon />
            </StatIconContainer>
            <StatDetails>
              <StatLabel>Subject Sessions</StatLabel>
              <StatValue>{animatedSessionCount}</StatValue>
            </StatDetails>
          </SubjectStatCard>
        </SubjectStatsContainer>
      </>
    );
  }

  const useAnimatedNumber = (end, duration = 1000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const timer = setInterval(() => {
        start += Math.ceil(end / (duration / 50));
        if (start >= end) {
          start = end;
          clearInterval(timer);
        }
        setCount(start);
      }, 50);

      return () => clearInterval(timer);
    }, [end, duration]);

    return count;
  };

  return (
    <>
      {subloading ?
        < div > Loading...</div >
        :
        <>
          <Box sx={{ width: '100%', typography: 'body1', }} >
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChange} sx={{ position: 'fixed', width: '100%', bgcolor: 'background.paper', zIndex: 1 }}>
                  <Tab label="Details" value="1" />
                  <Tab label="Students" value="2" />
                </TabList>
              </Box>
              <Container sx={{ marginTop: "3rem", marginBottom: "4rem" }}>
                <TabPanel value="1">
                  <SubjectDetailsSection />
                </TabPanel>
                <TabPanel value="2">
                  <SubjectStudentsSection />
                </TabPanel>
              </Container>
            </TabContext>
          </Box>
        </>
      }
    </>
  )
}

export default ViewSubject

const DetailsContainer = styled.div`
  width: 90%;
  max-width: 900px;
  margin: 2rem auto;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 16px;
  box-shadow: 
    0 15px 25px rgba(0, 0, 0, 0.05), 
    0 5px 15px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 
      0 20px 30px rgba(0, 0, 0, 0.08), 
      0 7px 20px rgba(0, 0, 0, 0.05);
    transform: translateY(-5px);
  }
`;

const DetailTitle = styled(Typography)`
  && {
    font-weight: 800;
    line-height: 1.2;
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    text-align: center;
    color: #2c3e50;
    padding: 1.5rem 1rem;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 4px;
      background: linear-gradient(90deg, #3498db, #2ecc71);
      border-radius: 2px;
    }
  }
`;

const DetailRow = styled.details`
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:first-of-type {
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }
  
  &[open] {
    background-color: rgba(52, 152, 219, 0.02);
    
    summary {
      &::before {
        transform: rotate(45deg);
        opacity: 1;
      }
    }
  }
  
  summary {
    display: flex;
    align-items: center;
    padding: 1.2em 1.5em;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: rgba(52, 152, 219, 0.05);
    }
    
    &::before {
      content: '▼';
      position: absolute;
      right: 1.5em;
      color: #3498db;
      opacity: 0.5;
      transition: all 0.3s ease;
      transform: rotate(0deg);
      font-size: 0.8em;
    }
    
    &::-webkit-details-marker {
      display: none;
    }
  }
`;

const DetailLabel = styled.span`
  font-weight: 700;
  color: #2c3e50;
  font-size: 1rem;
  min-width: 200px;
  transition: color 0.3s ease;

  ${DetailRow}[open] & {
    color: #3498db;
  }
`;

const DetailValue = styled.span`
  color: #34495e;
  font-weight: 500;
  margin-left: auto;
  transition: color 0.3s ease;

  ${DetailRow}[open] & {
    color: #2ecc71;
  }
`;

const AddTeacherButton = styled(PurpleButton)`
  && {
    display: block;
    margin: 1.5rem auto;
    padding: 12px 24px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
      background: linear-gradient(135deg, #8e44ad, #9b59b6);
    }
  }
`;

const ButtonContainer = styled.div`
 display: flex;
 gap: 1rem;
 align-items: center;
`;

const SubjectHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f6f8f9 0%, #e5ebee 100%);
  border-bottom: 1px solid rgba(0,0,0,0.1);
`;

const SubjectHeaderDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: #3498db;
    font-size: 2rem;
    opacity: 0.8;
  }
`;

const SubjectHeaderText = styled.div`
  display: flex;
  flex-direction: column;
`;

const SubjectHeaderLabel = styled.span`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
`;

const SubjectHeaderValue = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
`;

const AnimatedCount = styled.span`
  font-weight: 700;
  color: #3498db;
`;

const SubjectStatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f0f3f5 100%);
`;

const SubjectStatCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  width: 90%;
  height: 180px;
  margin: 0 auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
  }
`;

const StatIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(52, 152, 219, 0.1);
  
  svg {
    color: #3498db;
    font-size: 2rem;
  }
`;

const StatDetails = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
`;