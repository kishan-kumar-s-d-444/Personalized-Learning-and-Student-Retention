import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", sessions: "" }]);
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()
    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;

    const sclassName = params.id
    const adminID = currentUser._id
    const address = "Subject"

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    const handleSubjectNameChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subName = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSubjectCodeChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subCode = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSessionsChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].sessions = event.target.value || 0;
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", subCode: "", sessions: "" }]);
    };

    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const fields = {
        sclassName,
        subjects: subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        })),
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        
        // Validate subjects before submission
        const isValid = subjects.every(subject => 
            subject.subName.trim() !== "" && 
            subject.subCode.trim() !== "" && 
            subject.sessions !== ""
        );

        if (!isValid) {
            setMessage("Please fill in all subject details");
            setShowPopup(true);
            return;
        }

        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
            dispatch(underControl())
            setLoader(false)
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
        <div style={styles.container}>
            <div style={styles.formWrapper}>
                <form style={styles.form} onSubmit={submitHandler}>
                    <h2 style={styles.title}>Add Subjects</h2>
                    {subjects.map((subject, index) => (
                        <div key={index} style={styles.subjectGroup}>
                            <div style={styles.inputGroup}>
                                <input 
                                    type="text" 
                                    style={styles.input}
                                    placeholder="Subject Name"
                                    value={subject.subName}
                                    onChange={handleSubjectNameChange(index)}
                                    required 
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <input 
                                    type="text" 
                                    style={styles.input}
                                    placeholder="Subject Code"
                                    value={subject.subCode}
                                    onChange={handleSubjectCodeChange(index)}
                                    required 
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <input 
                                    type="number" 
                                    style={styles.input}
                                    placeholder="Sessions"
                                    value={subject.sessions}
                                    onChange={handleSessionsChange(index)}
                                    min="0"
                                    required 
                                />
                            </div>
                            <div style={styles.buttonGroup}>
                                {index === 0 ? (
                                    <button 
                                        type="button"
                                        style={{...styles.button, ...styles.addButton}}
                                        onClick={handleAddSubject}
                                    >
                                        Add Subject
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        style={{...styles.button, ...styles.removeButton}}
                                        onClick={handleRemoveSubject(index)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <button 
                        type="submit" 
                        style={styles.submitButton}
                        disabled={loader}
                    >
                        {loader ? 'Saving...' : 'Save Subjects'}
                    </button>
                </form>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
}

export default SubjectForm;

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    formWrapper: {
        width: '100%',
        maxWidth: '500px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    title: {
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: '600',
    },
    subjectGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '15px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px',
        transition: 'background-color 0.2s ease',
    },
    inputGroup: {
        position: 'relative',
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        outline: 'none',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '10px',
    },
    button: {
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        outline: 'none',
    },
    addButton: {
        backgroundColor: '#3498db',
        color: 'white',
        marginRight: '10px',
    },
    removeButton: {
        backgroundColor: '#e74c3c',
        color: 'white',
    },
    submitButton: {
        backgroundColor: '#2ecc71',
        color: 'white',
        padding: '12px 20px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        outline: 'none',
        width: '100%',
    },
};