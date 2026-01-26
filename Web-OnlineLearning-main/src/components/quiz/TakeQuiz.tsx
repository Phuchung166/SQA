'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import quizzService, { Quiz, QuizAttempt } from '@/services/quizzService';

interface TakeQuizProps {
  quizId: number;
  onComplete?: (result: any) => void;
}

const TakeQuiz: React.FC<TakeQuizProps> = ({ quizId, onComplete }) => {
  const t = useTranslations('TakeQuiz');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizAttemptId, setQuizAttemptId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = quiz?.questions?.length || 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Fetch quiz details
  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const data = await quizzService.getQuizById(quizId);
      setQuiz(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      const attempt = await quizzService.createQuizAttempt(quizId);
      setQuizAttemptId(attempt.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start quiz');
    }
  };

  const handleSelectOption = (optionId: number) => {
    if (currentQuestion) {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizAttemptId) {
      toast.error('Quiz attempt not initialized');
      return;
    }

    setIsSubmitting(true);
    try {
      const optionIds = Object.values(selectedAnswers);
      const response = await quizzService.submitQuizAnswers({
        option_ids: optionIds,
        quiz_attempt_id: quizAttemptId,
      });

      // Calculate pass/fail based on 50% threshold
      const percentage = (response.correct_answer / response.total_question) * 100;
      const resultWithPassed = {
        ...response,
        passed: percentage >= 50,
      };

      setResult(resultWithPassed);
      setShowResult(true);
      toast.success('Quiz submitted successfully!');
      onComplete?.(resultWithPassed);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="quiz-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{t('loadingQuiz')}</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-container">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{t('quizNotFound')}</p>
        </div>
      </div>
    );
  }

  // Before quiz starts
  if (!quizAttemptId) {
    return (
      <div className="quiz-container container">
        <div className="quiz-intro">
          <div className="intro-header">
            <h1>{quiz.title}</h1>
          </div>

          <div className="intro-content">
            <p className="intro-description">{quiz.description}</p>

            <div className="quiz-info-grid">
              <div className="info-item">
                <i className="fas fa-question-circle"></i>
                <div>
                  <span className="info-label">{t('totalQuestions')}</span>
                  <span className="info-value">{totalQuestions}</span>
                </div>
              </div>
            </div>

            <div className="intro-notice">
              <i className="fas fa-info-circle"></i>
              <div>
                <strong>{t('beforeYouStart')}</strong>
                <ul>
                  <li>{t('stableConnection')}</li>
                  <li>{t('navigateQuestions')}</li>
                  <li>{t('progressSaved')}</li>
                </ul>
              </div>
            </div>

            <button className="bd-btn btn-primary btn-large" onClick={startQuiz}>
              <i className="fas fa-play"></i> {t('startQuiz')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz result
  if (showResult && result) {
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <div className={`result-status ${result.passed ? 'passed' : 'failed'}`}>
            <i className={`fas fa-${result.passed ? 'check-circle' : 'times-circle'}`}></i>
            <h2>{result.passed ? t('congratulations') : t('quizNotPassed')}</h2>
            <p className="result-score">
              {t('yourScore')}: <strong>{result.correct_answer}</strong> /{' '}
              <strong>{result.total_question}</strong>
            </p>
            <p className="result-percentage">
              {Math.round((result.correct_answer / result.total_question) * 100)}%
            </p>
          </div>

          <div className="result-details">
            <h3>{t('quizDetails')}</h3>
            <div className="detail-item">
              <span>{t('correctAnswers')}:</span>
              <strong>{result.correct_answer}</strong>
            </div>
            <div className="detail-item">
              <span>{t('totalQuestions')}:</span>
              <strong>{result.total_question}</strong>
            </div>
            <div className="detail-item">
              <span>{t('completionTime')}:</span>
              <strong>{new Date(result.completed_at).toLocaleString()}</strong>
            </div>
          </div>

          <div className="result-actions">
            <button
              className="bd-btn btn-primary"
              onClick={() => (window.location.href = '/student-enrolled-courses')}
            >
              <i className="fas fa-arrow-left"></i> {t('backToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Taking quiz
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-title-section">
          <h2>{quiz.title}</h2>
        </div>
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          ></div>
        </div>
        <span className="progress-text">
          {t('question')} {currentQuestionIndex + 1} {t('of')} {totalQuestions}
        </span>
      </div>

      <div className="quiz-content">
        {currentQuestion && (
          <div className="question-card">
            <div className="question-number">Q{currentQuestionIndex + 1}</div>
            <h3 className="question-text">{currentQuestion.question_text}</h3>

            <div className="options-list">
              {currentQuestion.options?.map(option => (
                <label key={option.id} className="option-item">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={selectedAnswers[currentQuestion.id] === option.id}
                    onChange={() => handleSelectOption(option.id)}
                  />
                  <span className="option-text">{option.option_text}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="quiz-footer">
        <button
          className="bd-btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <i className="fas fa-chevron-left"></i> {t('previous')}
        </button>

        <div className="question-counter">
          {currentQuestionIndex + 1} / {totalQuestions}
        </div>

        {isLastQuestion ? (
          <button className="bd-btn btn-primary" onClick={handleSubmitQuiz} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> {t('submitting')}
              </>
            ) : (
              <>
                <i className="fas fa-check"></i> {t('submitQuiz')}
              </>
            )}
          </button>
        ) : (
          <button className="bd-btn btn-primary" onClick={handleNext}>
            {t('next')} <i className="fas fa-chevron-right"></i>
          </button>
        )}
      </div>
    </div>
  );
};
export default TakeQuiz;
