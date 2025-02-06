import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherFreeClassSubjects } from '../../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';

const ChooseSubject = ({ situation }) => {
    const params = useParams();
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const [classID, setClassID] = useState("");
    const [teacherID, setTeacherID] = useState("");
    const [loader, setLoader] = useState(false)

    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);

    useEffect(() => {
        if (situation === "Norm") {
            setClassID(params.id);
            const classID = params.id
            dispatch(getTeacherFreeClassSubjects(classID));
        }
        else if (situation === "Teacher") {
            const { classID, teacherID } = params
            setClassID(classID);
            setTeacherID(teacherID);
            dispatch(getTeacherFreeClassSubjects(classID));
        }
    }, [situation, params, dispatch]);

    const updateSubjectHandler = (teacherId, teachSubject) => {
        setLoader(true)
        dispatch(updateTeachSubject(teacherId, teachSubject))
        navigate("/Admin/teachers")
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <p style={styles.loadingText}>Loading Subjects...</p>
                </div>
            )
        }

        if (response) {
            return (
                <div style={styles.addSubjectContainer}>
                    <p style={styles.emptyStateText}>Sorry, all subjects have teachers assigned already</p>
                    <button 
                        style={styles.addSubjectButton} 
                        onClick={() => navigate("/Admin/addsubject/" + classID)}
                    >
                        <span style={styles.buttonIcon}>+</span>
                        Add Subjects
                    </button>
                </div>
            )
        }

        return (
            <div style={styles.container}>
                <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <div style={styles.headerContainer}>
                    <h2 style={styles.heading}>Select a Subject</h2>
                    <p style={styles.subheading}>
                        Choose a subject {situation === "Teacher" ? "for teacher assignment" : "to proceed"}
                    </p>
                </div>
                <div style={styles.cardList}>
                    {Array.isArray(subjectsList) && subjectsList.length > 0 ? (
                        subjectsList.map((subject) => (
                            <div 
                                key={subject._id} 
                                style={styles.card}
                                onClick={() => {
                                    situation === "Norm" 
                                        ? navigate("/Admin/teachers/addteacher/" + subject._id)
                                        : updateSubjectHandler(teacherID, subject._id)
                                }}
                            >
                                <div style={styles.cardHeader}>
                                    <div style={styles.classNameContainer}>
                                        <span style={styles.classIcon}>📚</span>
                                        <a href="#!" style={styles.className}>{subject.subName}</a>
                                    </div>
                                    <button style={styles.iconButton}>
                                        <span style={styles.arrowIcon}>→</span>
                                    </button>
                                </div>
                                <div style={styles.cardFooter}>
                                    <div style={styles.cardMeta}>
                                        <span style={styles.metaIcon}>🏫</span>
                                        Subject Code: {subject.subCode}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={styles.emptyState}>
                            <span style={styles.emptyIcon}>🚫</span>
                            <p>No subjects available. Add a new subject to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return renderContent();
}

export default ChooseSubject;

const styles = {
    container: {
        fontFamily: '"Lexend", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6f8f9 0%, #e5ebee 100%)',
        padding: '1rem',
    },
    headerContainer: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        maxWidth: '800px',
    },
    heading: {
        color: '#2c3e50',
        fontSize: '2.5rem',
        fontWeight: '800',
        marginBottom: '0.75rem',
        letterSpacing: '-1px',
        background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subheading: {
        color: '#7f8c8d',
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.5',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
    },
    loadingSpinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '1rem',
        color: '#2c3e50',
        fontSize: '1.25rem',
    },
    cardList: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1rem',
        width: '100%',
        maxWidth: '1000px',
        marginTop: '1rem',
    },
    card: {
        flex: '0 1 calc(33.333% - 1rem)', 
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: '1px solid transparent',
        minWidth: '250px', 
        maxWidth: '350px', 
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
    },
    classNameContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    classIcon: {
        marginRight: '0.75rem',
        fontSize: '1.5rem',
    },
    className: {
        color: '#2c3e50',
        fontSize: '1.25rem',
        fontWeight: '600',
        textDecoration: 'none',
    },
    iconButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    arrowIcon: {
        fontSize: '1.5rem',
        color: '#3498db',
    },
    cardFooter: {
        borderTop: '1px solid #ecf0f1',
        paddingTop: '1rem',
    },
    cardMeta: {
        display: 'flex',
        alignItems: 'center',
        color: '#7f8c8d',
        fontSize: '0.9rem',
    },
    metaIcon: {
        marginRight: '0.5rem',
        fontSize: '1.25rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '15px',
    },
    emptyIcon: {
        fontSize: '3rem',
        display: 'block',
        marginBottom: '1rem',
    },
    addSubjectContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '2rem',
    },
    emptyStateText: {
        fontSize: '1.5rem',
        color: '#7f8c8d',
        marginBottom: '1.5rem',
    },
    addSubjectButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    buttonIcon: {
        marginRight: '0.5rem',
        fontSize: '1.25rem',
    },
};