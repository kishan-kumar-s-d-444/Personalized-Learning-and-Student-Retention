import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { addStuff } from '../../../redux/userRelated/userHandle';

const DropoutStudent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { studentsList, loading, error } = useSelector((state) => state.student);
  const { currentUser } = useSelector(state => state.user);
  const { dropoutRate } = useParams();
  const location = useLocation();
  const studentData = location.state?.studentData || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [showTextarea, setShowTextarea] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    dispatch(getAllStudents(currentUser._id));
  }, [currentUser._id, dispatch]);

  useEffect(() => {
    if (studentsList && studentsList.length > 0) {
      const students = studentsList.filter(student => studentData.some(data => data.studentId === student._id));
      setFilteredStudents(students);
    }
  }, [studentsList, studentData]);

  const handleIssueNotice = (student) => {
    setSelectedStudent(student);
    setShowTextarea(true);
  };

  const getStudentRiskFactors = (student) => {
    const factors = [];
    const data = studentData.find(data => data.studentId === student._id);

    if (data && data.attendanceScore < 50)
      factors.push('Poor Attendance');

    if (data && data.averageScore < 50)
      factors.push('Low Marks');

    return factors;
  };

  const styles = {
    DropoutStudent: {
      padding: '20px',
      textAlign: 'center'
    },
    title: {
      color: '#333',
      marginBottom: '20px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '20px'
    },
    card: {
      background: '#f1f1f1',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    },
    cardTitle: {
      color: '#333',
      marginBottom: '10px'
    },
    cardText: {
      fontSize: '16px',
      marginBottom: '20px'
    },
    button: {
      background: '#007bff',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background 0.3s'
    },
    searchBar: {
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      marginBottom: '20px',
      width: '100%',
      maxWidth: '300px'
    },
    popup: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#fff',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      zIndex: 1000
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999
    },
    textarea: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      border: '1px solid #ccc'
    }
  };

  return (
    <div style={styles.DropoutStudent}>
      <h1>{dropoutRate.charAt(0).toUpperCase() + dropoutRate.slice(1)} Dropout Students</h1>
      <input
        type="text"
        placeholder="Search by name..."
        style={styles.searchBar}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <div style={styles.grid}>
          {filteredStudents
            .filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(student => {
              const data = studentData.find(data => data.studentId === student._id);
              const attendancePercentage = data ? (data.attendanceScore).toFixed(2) : '0.00';
              const scorePercentage = data ? data.averageScore.toFixed(2) : '0.00';

              return (
                <div key={student._id} style={styles.card}>
                  <h2>{student.name}</h2>
                  <p>Attendance: {attendancePercentage}%</p>
                  <p>Score: {scorePercentage}%</p>
                  <button
                    onClick={() => handleIssueNotice(student)}
                    style={{ ...styles.button, marginBottom: "10px" }}
                  >
                    Issue Notice
                  </button>
                  <button
                    onClick={() => navigate("/Admin/students/student/" + student._id)}
                    style={styles.button}
                  >
                    View Student
                  </button>
                  <div style={styles.riskFactors}>
                    <h4>Risk Factors:</h4>
                    {getStudentRiskFactors(student).map(factor => (
                      <span key={factor} style={styles.riskBadge}>{factor}<br /></span>
                    ))}

                  </div>

                </div>
              );
            })}
        </div>
      )}
      {showTextarea && selectedStudent && (
        <div style={{ marginBottom: "20px" }}>
          <textarea
            placeholder="Type additional message here..."
            style={styles.textarea}
            value={additionalMessage}
            onChange={(e) => setAdditionalMessage(e.target.value)}
          />
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];

              const title = `${dropoutRate.charAt(0).toUpperCase() + dropoutRate.slice(1)} Dropout Risk Alert - ${selectedStudent.name}`;
              const details = `Alert: Student ${selectedStudent.name} (Roll No: ${selectedStudent.rollNum}) has been identified as ${dropoutRate}-risk for dropping out. ` +
                `${additionalMessage}`; // Include the additional message here

              const noticeFields = {
                title,
                details,
                date: today,
                adminID: currentUser._id
              };

              dispatch(addStuff(noticeFields, "Notice"));
              setPopupMessage(`Notice issued for ${selectedStudent.name}`);
              setShowTextarea(false);
            }}
            style={{ ...styles.button, marginBottom: "10px" }}
          >
            Send Notice
          </button>
        </div>
      )}
      {popupMessage && (
        <div>
          <div style={styles.overlay} onClick={() => setPopupMessage('')}></div>
          <div style={styles.popup}>
            <p>{popupMessage}</p>
            <button onClick={() => setPopupMessage('')} style={styles.button}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropoutStudent;
