import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import { Box } from '@mui/material';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

const SubjectContainer = styled.div`
  width: 1142px;
  margin: 0 auto;
  padding: 32px 0;
`;

const SubjectsGrid = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 30px;
  padding: 50px 0;
`;

const SubjectCard = styled.div`
  flex-basis: calc(33.33333% - 30px);
  overflow: hidden;
  border-radius: 28px;
  background-color: #ffffff;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media only screen and (max-width: 979px) {
    flex-basis: calc(50% - 30px);
  }

  @media only screen and (max-width: 639px) {
    flex-basis: 100%;
  }
`;

const CardLink = styled.div`
  display: block;
  padding: 30px 20px;
  position: relative;
  overflow: hidden;
`;

const CardBackground = styled.div`
  height: 128px;
  width: 128px;
  background-color: ${props => props.color};
  position: absolute;
  top: -75px;
  right: -75px;
  border-radius: 50%;
  transition: all 0.5s ease;
  z-index: 1;

  ${CardLink}:hover & {
    transform: scale(10);
  }
`;

const CardTitle = styled.div`
  min-height: 60px;
  margin: 0 0 15px;
  font-weight: bold;
  font-size: 30px;
  color: #333;
  position: relative;
  z-index: 2;
  transition: color 0.5s ease;
  text-align: center;

  ${CardLink}:hover & {
    color: #FFF;
  }

  @media only screen and (max-width: 979px) {
    font-size: 24px;
  }
`;

const CardInfo = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
  position: relative;
  z-index: 2;
  text-align: center;
  transition: color 0.5s ease;

  ${CardLink}:hover & {
    color: #FFF;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  position: relative;
  z-index: 2;
  transition: color 0.5s ease;
  margin-top: 20px;

  ${CardLink}:hover & {
    color: #FFF;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  font-size: 16px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;
const SpeedDialContainer = styled.div`
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
`;

const ShowSubjects = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(getSubjectList(currentUser._id, "AllSubjects"));
  }, [currentUser._id, dispatch]);

  if (error) {
    console.log(error);
  }

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const deleteHandler = (deleteID, address) => {
    dispatch(deleteUser(deleteID, address))
      .then(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
      });
  };

  const actions = [
    {
      icon: <PostAddIcon color="primary" />,
      name: 'Add New Subject',
      action: () => navigate("/Admin/subjects/chooseclass"),
    },
    {
      icon: <DeleteIcon color="error" />,
      name: 'Delete All Subjects',
      action: () => deleteHandler(currentUser._id, "Subjects"),
    },
  ];

  const cardColors = ['#f9b234', '#3ecd5e', '#e44002', '#952aff', '#cd3e94', '#4c49ea'];

  return (
    <>
      <h1 style={{ textAlign: "center" }}><b>Subjects</b></h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <SubjectContainer>
          {response ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <GreenButton
                variant="contained"
                onClick={() => navigate("/Admin/subjects/chooseclass")}
              >
                Add Subjects
              </GreenButton>
            </Box>
          ) : (
            <SubjectsGrid>
              {subjectsList.map((subject, index) => (
                <SubjectCard key={subject._id}>
                  <CardLink>
                    <CardBackground color={cardColors[index % cardColors.length]} />
                    <CardTitle>{subject.subName}</CardTitle>
                    <CardInfo>Class: {subject.sclassName.sclassName}</CardInfo>
                    <CardInfo>Sessions: {subject.sessions}</CardInfo>
                    <CardActions>
                      <ActionButton onClick={() => deleteHandler(subject._id, "Subject")}>
                        <DeleteIcon />
                      </ActionButton>
                      <ActionButton
                        onClick={() => navigate(`/Admin/subjects/subject/${subject.sclassName._id}/${subject._id}`)}
                      >
                        View
                      </ActionButton>
                    </CardActions>
                  </CardLink>
                </SubjectCard>
              ))}
            </SubjectsGrid>
          )}
          <SpeedDialContainer>
            <SpeedDialTemplate actions={actions} />
          </SpeedDialContainer>
        </SubjectContainer>
      )}
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ShowSubjects;
