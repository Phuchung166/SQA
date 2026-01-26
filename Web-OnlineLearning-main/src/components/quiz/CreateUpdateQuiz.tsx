'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Checkbox } from 'antd';
import { toast } from 'sonner';
import {
  getInstructorCourses,
  getCourseModules,
  Course,
  CourseModule,
} from '@/services/courseService';
import quizzService, { ImportQuestionsRequest, Quiz } from '@/services/quizzService';
import ErrorMsg from '@/form/auth/ErrorMsg';
import { useTranslations } from 'next-intl';

interface CreateUpdateQuizProps {
  quizId?: number;
  initialQuiz?: Quiz;
  onSuccess?: () => void;
}

interface QuizFormData {
  course_id: number;
  module_id: number;
  title: string;
  description: string;
  file: FileList;
  isMandatory?: boolean;
}

const CreateUpdateQuiz: React.FC<CreateUpdateQuizProps> = ({ quizId, initialQuiz, onSuccess }) => {
  const searchParams = useSearchParams();
  const moduleIdFromUrl = searchParams?.get('moduleId');
  const t = useTranslations('CreateUpdateQuiz');

  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isMandatory, setIsMandatory] = useState(false);

  const pageTitle = quizId ? t('updateTitle') : t('createTitle');
  const isEditMode = !!quizId;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<QuizFormData>({
    defaultValues: {
      course_id: selectedCourseId || undefined,
      module_id: moduleIdFromUrl ? parseInt(moduleIdFromUrl) : undefined,
      title: initialQuiz?.title || '',
      description: initialQuiz?.description || '',
    },
  });

  const selectedCourse = watch('course_id');
  const selectedModule = watch('module_id');
  const router = useRouter();

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseModules(selectedCourse);
    } else {
      setModules([]);
    }
  }, [selectedCourse]);

  const fetchInstructorCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await getInstructorCourses({
        page: 1,
        pageSize: 100,
      });
      setCourses(response.data || []);
    } catch (error: any) {
      toast.error(error.message || t('failedToLoadCourses'));
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchCourseModules = async (courseId: number) => {
    try {
      setLoadingModules(true);
      const response = await getCourseModules({
        page: 1,
        pageSize: 100,
        courseId,
      });
      setModules(response.data || []);
    } catch (error: any) {
      toast.error(error.message || t('failedToLoadModules'));
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  const onSubmit: SubmitHandler<QuizFormData> = async data => {
    if (!uploadedFile) {
      toast.error(t('selectExcelFile'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ImportQuestionsRequest = {
        title: data.title,
        description: data.description,
        moduleId: data.module_id,
        file: uploadedFile,
        isMandatory: isMandatory,
      };

      await quizzService.importQuizQuestions(payload);

      if (isEditMode) {
        toast.success(t('updateSuccess'));
      } else {
        toast.success(t('createSuccess'));
        reset();
        setSelectedCourseId(null);
        setValue('course_id', 0);
        setValue('module_id', 0);
        setUploadedFile(null);
        const fileInput = document.getElementById('quiz_file') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        router.push('/quizzes');
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || t('failedToSave'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    // Reset file input
    const fileInput = document.getElementById('quiz_file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const downloadTemplate = () => {
    const url = 'https://d32trhawgfkkkj.cloudfront.net/documents/template-question.xlsx';
    console.log('Downloading from:', url);
    // Use window.location for direct download
    window.location.href = url;
  };

  return (
    <div
      className="create-update-quiz-container container"
      style={{ marginTop: 50, marginBottom: 50 }}
    >
      <div className="page-header">
        <h1>
          <i className="fas fa-file-video"></i> {pageTitle}
        </h1>
        <p>{isEditMode ? t('updateDescription') : t('createDescription')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="quiz-form-container">
        {/* Step 3: Quiz Details */}
        <div className="form-section">
          <div className="section-header">
            <h2>
              <span className="step-number">{t('step')}</span>
              {t('quizDetails')}
            </h2>
          </div>

          <div className="row gy-20">
            <div className="col-lg-12">
              <div className="form-group">
                <label htmlFor="quiz_title">
                  {t('quizTitle')} <span className="required">{t('required')}</span>
                </label>
                <input
                  id="quiz_title"
                  type="text"
                  placeholder={t('quizTitlePlaceholder')}
                  {...register('title', {
                    required: t('quizTitleRequired'),
                    minLength: {
                      value: 3,
                      message: t('titleMinLength'),
                    },
                  })}
                />
                <ErrorMsg error={errors?.title?.message} />
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group">
                <label htmlFor="quiz_description">{t('quizDescription')}</label>
                <textarea
                  id="quiz_description"
                  placeholder={t('descriptionPlaceholder')}
                  rows={4}
                  {...register('description')}
                ></textarea>
                <ErrorMsg error={errors?.description?.message} />
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group">
                <label htmlFor="quiz_file">
                  {t('importQuestions')} <span className="required">{t('required')}</span>
                </label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    className="template-download-btn"
                    onClick={downloadTemplate}
                  >
                    <i className="fas fa-download"></i>
                    {t('downloadTemplate')}
                  </button>
                </div>
                <div className="file-input-wrapper">
                  <input
                    id="quiz_file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="quiz_file" className="file-input-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <span>{t('uploadInstructions')}</span>
                    <small>{t('supportedFormats')}</small>
                  </label>
                </div>
                {uploadedFile && (
                  <div className="file-info-box">
                    <i className="fas fa-file-excel"></i>
                    <div className="file-details">
                      <div className="file-name">{uploadedFile.name}</div>
                      <div className="file-size">{formatFileSize(uploadedFile.size)}</div>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={handleRemoveFile}
                      title={t('removeFile')}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                <ErrorMsg error={errors?.file?.message} />
              </div>
            </div>

            <div className="col-lg-12">
              <Checkbox
                checked={isMandatory}
                onChange={e => setIsMandatory(e.target.checked)}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <span style={{ marginLeft: '4px' }}>
                  <i
                    className="fa-solid fa-star"
                    style={{ color: '#d32f2f', marginRight: '6px' }}
                  ></i>
                  {t('isMandatory')}
                </span>
              </Checkbox>
              <p
                style={{
                  fontSize: '12px',
                  color: '#666',
                  margin: '8px 0 0 28px',
                  lineHeight: '1.4',
                }}
              >
                {t('isMandatoryHelp')}
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        {selectedModule && (
          <div className="form-actions">
            <button
              type="button"
              className="bd-btn btn-secondary"
              onClick={() => {
                reset();
                setSelectedCourseId(null);
              }}
              disabled={isSubmitting}
            >
              <i className="fas fa-times"></i> {t('reset')}
            </button>
            <button
              type="submit"
              className="bd-btn btn-primary"
              disabled={isSubmitting || loadingModules}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>{' '}
                  {isEditMode ? t('updating') : t('creating')}
                  ...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> {isEditMode ? t('updateQuiz') : t('createQuiz')}
                </>
              )}
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="info-box">
          <i className="fas fa-info-circle"></i>
          <div>
            <strong>{t('note')}</strong> {t('noteContent')}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateUpdateQuiz;
