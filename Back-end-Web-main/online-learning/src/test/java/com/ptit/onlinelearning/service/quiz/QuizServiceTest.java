package com.ptit.onlinelearning.service.quiz;

import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.model.Option;
import com.ptit.onlinelearning.model.Question;
import com.ptit.onlinelearning.model.Quiz;
import com.ptit.onlinelearning.repository.CourseModuleRepository;
import com.ptit.onlinelearning.repository.OptionRepository;
import com.ptit.onlinelearning.repository.QuestionRepository;
import com.ptit.onlinelearning.repository.QuizRepository;
import com.ptit.onlinelearning.request.UpdateQuizRequest;
import com.ptit.onlinelearning.request.UpdateQuestionRequest;
import com.ptit.onlinelearning.request.OptionRequest;
import com.ptit.onlinelearning.response.quiz.OptionResponse;
import com.ptit.onlinelearning.response.quiz.QuizDetailResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho QuizService
 */
@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock private QuizRepository quizRepository;
    @Mock private CourseModuleRepository courseModuleRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private OptionRepository optionRepository;

    @InjectMocks
    private QuizService quizService;

    private Quiz mockQuiz;

    @BeforeEach
    void setUp() {
        mockQuiz = Quiz.builder()
                .id(1L)
                .title("Test Quiz")
                .isActive(true)
                .questions(new HashSet<>())
                .build();
    }

    // TC-QUIZ-001: getQuizById - Success
    @Test
    @DisplayName("TC-QUIZ-001: Lấy chi tiết Quiz thành công -> Không trả về isCorrect cho Student")
    void getQuizById_success() {
        Question q = new Question();
        q.setId(10L);
        q.setOptions(new HashSet<>());
        Option opt = new Option();
        opt.setId(100L);
        opt.setIsCorrect(true);
        opt.setSortOrder(1L);
        q.getOptions().add(opt);
        mockQuiz.getQuestions().add(q);

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        QuizDetailResponse res = quizService.getQuizById(1L);

        assertThat(res.getTitle()).isEqualTo("Test Quiz");
        assertThat(res.getQuestions()).hasSize(1);
        // Student shouldn't see isCorrect
        assertThat(res.getQuestions().get(0).getOptions().get(0).getIsCorrect()).isNull();
    }

    // TC-QUIZ-002: toggleQuizStatus - Success
    @Test
    @DisplayName("TC-QUIZ-002: Đổi trạng thái Quiz thành công (Active -> Inactive)")
    void toggleQuizStatus_success() {
        when(quizRepository.findQuizById(1L)).thenReturn(Optional.of(mockQuiz));

        String res = quizService.toggleQuizStatus(1L);

        assertThat(res).contains("deactivated");
        assertThat(mockQuiz.getIsActive()).isFalse();
    }

    // TC-QUIZ-003: getQuizByIdForInstructor - Success
    @Test
    @DisplayName("TC-QUIZ-003: Lấy chi tiết Quiz cho Instructor -> Phải trả về isCorrect")
    void getQuizByIdForInstructor_success() {
        Question q = new Question();
        q.setId(10L);
        q.setOptions(new HashSet<>());
        Option opt = new Option();
        opt.setId(100L);
        opt.setIsCorrect(true);
        opt.setSortOrder(1L);
        q.getOptions().add(opt);
        mockQuiz.getQuestions().add(q);

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        QuizDetailResponse res = quizService.getQuizByIdForInstructor(1L);

        // Instructor must see isCorrect
        assertThat(res.getQuestions().get(0).getOptions().get(0).getIsCorrect()).isTrue();
    }

    // TC-QUIZ-004: updateQuiz - Success
    @Test
    @DisplayName("TC-QUIZ-004: Cập nhật Quiz thành công (Thêm câu hỏi mới)")
    void updateQuiz_success() {
        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        req.setTitle("New Title");
        com.ptit.onlinelearning.request.UpdateQuestionRequest qReq = new com.ptit.onlinelearning.request.UpdateQuestionRequest();
        qReq.setQuestionText("New Question?");
        com.ptit.onlinelearning.request.OptionRequest oReq = new com.ptit.onlinelearning.request.OptionRequest();
        oReq.setOptionText("Option A");
        oReq.setOrder(1L);
        oReq.setIsCorrect(true);
        qReq.setOptions(java.util.List.of(oReq));
        req.setQuestions(java.util.List.of(qReq));

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));
        when(questionRepository.saveAndFlush(any(Question.class))).thenAnswer(i -> {
            Question q = i.getArgument(0); q.setId(55L); return q;
        });
        when(optionRepository.saveAndFlush(any(Option.class))).thenAnswer(i -> {
            Option o = i.getArgument(0); o.setId(66L); return o;
        });

        QuizDetailResponse res = quizService.updateQuiz(req);

        assertThat(res.getTitle()).isEqualTo("New Title");
        assertThat(mockQuiz.getQuestions()).hasSize(1);
        verify(questionRepository, times(1)).saveAndFlush(any(Question.class));
        verify(optionRepository, times(1)).saveAndFlush(any(Option.class));
    }

    // TC-QUIZ-005: getQuizById - Không tìm thấy -> Exception
    @Test
    @DisplayName("TC-QUIZ-005: getQuizById không tìm thấy -> DataNotFoundException")
    void getQuizById_notFound() {
        when(quizRepository.findByIdWithQuestionsAndOptions(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizService.getQuizById(999L))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Quiz not found with id");
    }

    // TC-QUIZ-006: toggleQuizStatus - Inactive -> Active
    @Test
    @DisplayName("TC-QUIZ-006: Đổi trạng thái Quiz từ Inactive sang Active")
    void toggleQuizStatus_inactiveToActive() {
        mockQuiz.setIsActive(false); // Đang inactive
        when(quizRepository.findQuizById(1L)).thenReturn(Optional.of(mockQuiz));

        String res = quizService.toggleQuizStatus(1L);

        assertThat(res).contains("activated");
        assertThat(mockQuiz.getIsActive()).isTrue();
    }

    // TC-QUIZ-007: toggleQuizStatus - Quiz không tồn tại -> Exception
    @Test
    @DisplayName("TC-QUIZ-007: toggleQuizStatus quiz không tồn tại -> DataNotFoundException")
    void toggleQuizStatus_notFound() {
        when(quizRepository.findQuizById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizService.toggleQuizStatus(999L))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Quiz not found with id");
    }

    // TC-QUIZ-008: getQuizStatisticsByModuleId - trả về PageableResponse
    @Test
    @DisplayName("TC-QUIZ-008: getQuizStatisticsByModuleId trả về PageableResponse")
    void getQuizStatisticsByModuleId_success() {
        org.springframework.data.domain.Page<com.ptit.onlinelearning.response.quiz.QuizStatisticResponse> page =
                new org.springframework.data.domain.PageImpl<>(java.util.List.of());
        when(quizRepository.statisticsQuizByModuleId(any(), eq(100L))).thenReturn(page);

        var res = quizService.getQuizStatisticsByModuleId(1, 10, 100L);

        assertThat(res).isNotNull();
        assertThat(res.getData()).isEmpty();
        verify(quizRepository, times(1)).statisticsQuizByModuleId(any(), eq(100L));
    }

    // TC-QUIZ-009: updateQuiz - questions null -> trả về quiz hiện tại
    @Test
    @DisplayName("TC-QUIZ-009: updateQuiz với questions=null -> trả về quiz không thay đổi")
    void updateQuiz_nullQuestions_returnsCurrentQuiz() {
        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        req.setTitle("Updated Title");
        req.setQuestions(null); // Không cập nhật questions

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        QuizDetailResponse res = quizService.updateQuiz(req);

        assertThat(res.getTitle()).isEqualTo("Updated Title");
        verify(questionRepository, never()).saveAndFlush(any());
    }

    // ===== BRANCH COVERAGE cho updateQuiz =====

    // TC-QUIZ-010: updateQuiz - Xóa câu hỏi (isDeleted=true)
    @Test
    @DisplayName("TC-QUIZ-010: updateQuiz xóa câu hỏi (isDeleted=true) -> question bị loại khỏi quiz")
    void updateQuiz_deleteQuestion_removesFromQuiz() {
        Question existingQ = new Question();
        existingQ.setId(10L);
        existingQ.setQuestionText("Old Question");
        existingQ.setOptions(new HashSet<>());
        mockQuiz.getQuestions().add(existingQ);

        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        com.ptit.onlinelearning.request.UpdateQuestionRequest qReq = new com.ptit.onlinelearning.request.UpdateQuestionRequest();
        qReq.setId(10L);
        qReq.setIsDeleted(true); // Đánh dấu xóa
        req.setQuestions(java.util.List.of(qReq));

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        QuizDetailResponse res = quizService.updateQuiz(req);

        // Quiz không còn câu hỏi nào
        assertThat(mockQuiz.getQuestions()).doesNotContain(existingQ);
        assertThat(res.getQuestions()).isEmpty();
    }

    // TC-QUIZ-011: updateQuiz - Cập nhật câu hỏi và option đã có (id != null)
    @Test
    @DisplayName("TC-QUIZ-011: updateQuiz cập nhật question & option đã tồn tại")
    void updateQuiz_updateExistingQuestionAndOption() {
        Option existingOpt = new Option();
        existingOpt.setId(100L);
        existingOpt.setOptionText("Old Text");
        existingOpt.setSortOrder(1L);
        existingOpt.setIsCorrect(false);

        Question existingQ = new Question();
        existingQ.setId(10L);
        existingQ.setQuestionText("Old Q");
        existingQ.setOptions(new HashSet<>(java.util.List.of(existingOpt)));
        mockQuiz.getQuestions().add(existingQ);

        // Request cập nhật question và option
        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        com.ptit.onlinelearning.request.UpdateQuestionRequest qReq = new com.ptit.onlinelearning.request.UpdateQuestionRequest();
        qReq.setId(10L);
        qReq.setQuestionText("Updated Q Text");

        com.ptit.onlinelearning.request.OptionRequest oReq = new com.ptit.onlinelearning.request.OptionRequest();
        oReq.setId(100L); // ID đã có -> update
        oReq.setOptionText("New Option Text");
        oReq.setOrder(2L);
        oReq.setIsCorrect(true);
        qReq.setOptions(java.util.List.of(oReq));
        req.setQuestions(java.util.List.of(qReq));

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        quizService.updateQuiz(req);

        assertThat(existingQ.getQuestionText()).isEqualTo("Updated Q Text");
        assertThat(existingOpt.getOptionText()).isEqualTo("New Option Text");
        assertThat(existingOpt.getSortOrder()).isEqualTo(2L);
        assertThat(existingOpt.getIsCorrect()).isTrue();
    }

    // TC-QUIZ-012: updateQuiz - Xóa option (isDeleted=true)
    @Test
    @DisplayName("TC-QUIZ-012: updateQuiz xóa option (isDeleted=true) -> option bị loại")
    void updateQuiz_deleteOption_removesFromQuestion() {
        Option existingOpt = new Option();
        existingOpt.setId(100L);
        existingOpt.setSortOrder(1L);

        Question existingQ = new Question();
        existingQ.setId(10L);
        existingQ.setOptions(new HashSet<>(java.util.List.of(existingOpt)));
        mockQuiz.getQuestions().add(existingQ);

        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        com.ptit.onlinelearning.request.UpdateQuestionRequest qReq = new com.ptit.onlinelearning.request.UpdateQuestionRequest();
        qReq.setId(10L);

        com.ptit.onlinelearning.request.OptionRequest oReq = new com.ptit.onlinelearning.request.OptionRequest();
        oReq.setId(100L);
        oReq.setIsDeleted(true); // Đánh dấu xóa option
        qReq.setOptions(java.util.List.of(oReq));
        req.setQuestions(java.util.List.of(qReq));

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        quizService.updateQuiz(req);

        assertThat(existingQ.getOptions()).doesNotContain(existingOpt);
    }

    // TC-QUIZ-013: updateQuiz - Thêm option mới vào câu hỏi đã có (oReq.getId() = null)
    @Test
    @DisplayName("TC-QUIZ-013: updateQuiz thêm option mới vào câu hỏi đã tồn tại")
    void updateQuiz_addNewOptionToExistingQuestion() {
        Question existingQ = new Question();
        existingQ.setId(10L);
        existingQ.setOptions(new HashSet<>());
        mockQuiz.getQuestions().add(existingQ);

        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        com.ptit.onlinelearning.request.UpdateQuestionRequest qReq = new com.ptit.onlinelearning.request.UpdateQuestionRequest();
        qReq.setId(10L);

        com.ptit.onlinelearning.request.OptionRequest oReq = new com.ptit.onlinelearning.request.OptionRequest();
        oReq.setId(null); // Null -> thêm mới
        oReq.setOptionText("Brand New Option");
        oReq.setOrder(1L);
        oReq.setIsCorrect(false);
        qReq.setOptions(java.util.List.of(oReq));
        req.setQuestions(java.util.List.of(qReq));

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));
        when(optionRepository.saveAndFlush(any(Option.class))).thenAnswer(i -> {
            Option o = i.getArgument(0); o.setId(999L); return o;
        });

        quizService.updateQuiz(req);

        assertThat(existingQ.getOptions()).hasSize(1);
        verify(optionRepository, times(1)).saveAndFlush(any(Option.class));
    }

    // TC-QUIZ-014: updateQuiz - question options null -> bỏ qua
    @Test
    @DisplayName("TC-QUIZ-014: updateQuiz - question options null -> tiếp tục không xử lý options")
    void updateQuiz_existingQuestion_nullOptions_skipsOptionProcessing() {
        Question existingQ = new Question();
        existingQ.setId(10L);
        existingQ.setOptions(new HashSet<>());
        mockQuiz.getQuestions().add(existingQ);

        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        com.ptit.onlinelearning.request.UpdateQuestionRequest qReq = new com.ptit.onlinelearning.request.UpdateQuestionRequest();
        qReq.setId(10L);
        qReq.setQuestionText("Updated");
        qReq.setOptions(null); // null options -> bỏ qua
        req.setQuestions(java.util.List.of(qReq));

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        quizService.updateQuiz(req);

        assertThat(existingQ.getQuestionText()).isEqualTo("Updated");
        verify(optionRepository, never()).saveAndFlush(any());
    }

    // TC-QUIZ-015: updateQuiz - Question không tồn tại (qReq.id != null nhưng không có trong quiz) -> Exception
    @Test
    @DisplayName("TC-QUIZ-015: updateQuiz question ID không thuộc quiz -> DataNotFoundException")
    void updateQuiz_questionNotFoundInQuiz_throwsException() {
        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        com.ptit.onlinelearning.request.UpdateQuestionRequest qReq = new com.ptit.onlinelearning.request.UpdateQuestionRequest();
        qReq.setId(999L); // ID lạ
        req.setQuestions(java.util.List.of(qReq));

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        assertThatThrownBy(() -> quizService.updateQuiz(req))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Question not found");
    }

    // TC-QUIZ-016: updateQuiz - Option không tồn tại (oReq.id != null nhưng không có trong question) -> Exception
    @Test
    @DisplayName("TC-QUIZ-016: updateQuiz option ID không thuộc question -> DataNotFoundException")
    void updateQuiz_optionNotFoundInQuestion_throwsException() {
        Question existingQ = new Question();
        existingQ.setId(10L);
        existingQ.setOptions(new HashSet<>());
        mockQuiz.getQuestions().add(existingQ);

        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        com.ptit.onlinelearning.request.UpdateQuestionRequest qReq = new com.ptit.onlinelearning.request.UpdateQuestionRequest();
        qReq.setId(10L);
        com.ptit.onlinelearning.request.OptionRequest oReq = new com.ptit.onlinelearning.request.OptionRequest();
        oReq.setId(888L); // ID lạ
        qReq.setOptions(java.util.List.of(oReq));
        req.setQuestions(java.util.List.of(qReq));

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        assertThatThrownBy(() -> quizService.updateQuiz(req))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Option not found");
    }

    // TC-QUIZ-017: importQuestions - Module không tồn tại -> Exception
    @Test
    @DisplayName("TC-QUIZ-017: importQuestions module không tồn tại -> RuntimeException wrapper")
    void importQuestions_moduleNotFound_throwsException() {
        when(courseModuleRepository.findById(100L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                quizService.importQuestions("Desc", "Title", 100L, null, true))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Course module not found");
    }

    // TC-QUIZ-018: updateQuiz - Chỉ cập nhật Title và Description
    @Test
    @DisplayName("TC-QUIZ-018: updateQuiz chỉ cập nhật Title và Description, không có questions")
    void updateQuiz_titleAndDescOnly_success() {
        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        req.setTitle("Very New Title");
        req.setDescription("Very New Desc");
        req.setQuestions(new java.util.ArrayList<>());

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        QuizDetailResponse res = quizService.updateQuiz(req);

        assertThat(res.getTitle()).isEqualTo("Very New Title");
        assertThat(mockQuiz.getDescription()).isEqualTo("Very New Desc");
    }

    // TC-QUIZ-019: importQuestions - Success
    @Test
    @DisplayName("TC-QUIZ-019: importQuestions thành công đọc file Excel")
    void importQuestions_success() throws Exception {
        CourseModule module = new CourseModule();
        module.setId(100L);
        when(courseModuleRepository.findById(100L)).thenReturn(Optional.of(module));
        when(quizRepository.saveAndFlush(any(Quiz.class))).thenAnswer(i -> i.getArgument(0));
        
        // Tạo file excel giả bằng apache POI
        org.apache.poi.ss.usermodel.Workbook wb = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
        org.apache.poi.ss.usermodel.Sheet sheet = wb.createSheet("Sheet1");
        
        // Header
        org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Question Text");
        headerRow.createCell(1).setCellValue("Option 1");
        headerRow.createCell(2).setCellValue("Option 2");
        headerRow.createCell(3).setCellValue("Option 3");
        headerRow.createCell(4).setCellValue("Option 4");
        headerRow.createCell(5).setCellValue("Correct Answer");
        
        // Data row 1
        org.apache.poi.ss.usermodel.Row dataRow = sheet.createRow(1);
        dataRow.createCell(0).setCellValue("Test Question");
        dataRow.createCell(1).setCellValue("A");
        dataRow.createCell(2).setCellValue("B");
        dataRow.createCell(3).setCellValue("C");
        dataRow.createCell(4).setCellValue("D");
        dataRow.createCell(5).setCellValue("1"); // Correct is Option 1

        // Data row 2 (Empty row)
        sheet.createRow(2);

        // Numeric cell check
        org.apache.poi.ss.usermodel.Row dataRow3 = sheet.createRow(3);
        dataRow3.createCell(0).setCellValue("Numeric Q");
        dataRow3.createCell(1).setCellValue(123); // NUMERIC
        dataRow3.createCell(5).setCellValue("2");

        java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
        wb.write(bos);
        wb.close();

        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                "file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bos.toByteArray());

        com.ptit.onlinelearning.response.MessageResponse res = quizService.importQuestions("Desc", "Title", 100L, file, true);

        assertThat(res.getMessage()).contains("successfully");
        verify(questionRepository, times(1)).saveAll(any());
    }

    // TC-QUIZ-020: updateQuiz - delete question not found
    @Test
    @DisplayName("TC-QUIZ-020: updateQuiz xóa câu hỏi nhưng câu hỏi không tồn tại -> Exception")
    void updateQuiz_deleteQuestion_notFound_throwsException() {
        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        com.ptit.onlinelearning.request.UpdateQuestionRequest qReq = new com.ptit.onlinelearning.request.UpdateQuestionRequest();
        qReq.setId(999L);
        qReq.setIsDeleted(true);
        req.setQuestions(java.util.List.of(qReq));

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        assertThatThrownBy(() -> quizService.updateQuiz(req))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Question not found");
    }

    // TC-QUIZ-021: updateQuiz - delete option not found
    @Test
    @DisplayName("TC-QUIZ-021: updateQuiz xóa option nhưng option không tồn tại -> Exception")
    void updateQuiz_deleteOption_notFound_throwsException() {
        Question existingQ = new Question();
        existingQ.setId(10L);
        existingQ.setOptions(new HashSet<>());
        mockQuiz.getQuestions().add(existingQ);

        com.ptit.onlinelearning.request.UpdateQuizRequest req = new com.ptit.onlinelearning.request.UpdateQuizRequest();
        req.setId(1L);
        com.ptit.onlinelearning.request.UpdateQuestionRequest qReq = new com.ptit.onlinelearning.request.UpdateQuestionRequest();
        qReq.setId(10L);
        com.ptit.onlinelearning.request.OptionRequest oReq = new com.ptit.onlinelearning.request.OptionRequest();
        oReq.setId(999L);
        oReq.setIsDeleted(true);
        qReq.setOptions(java.util.List.of(oReq));
        req.setQuestions(java.util.List.of(qReq));

        when(quizRepository.findByIdWithQuestionsAndOptions(1L)).thenReturn(Optional.of(mockQuiz));

        assertThatThrownBy(() -> quizService.updateQuiz(req))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Option not found");
    }

    // TC-QUIZ-022: importQuestions - throw IOException
    @Test
    @DisplayName("TC-QUIZ-022: importQuestions file error -> RuntimeException")
    void importQuestions_fileError_throwsException() throws Exception {
        CourseModule module = new CourseModule();
        module.setId(100L);
        when(courseModuleRepository.findById(100L)).thenReturn(Optional.of(module));
        when(quizRepository.saveAndFlush(any(Quiz.class))).thenAnswer(i -> i.getArgument(0));

        org.springframework.web.multipart.MultipartFile mockFile = mock(org.springframework.web.multipart.MultipartFile.class);
        when(mockFile.getInputStream()).thenThrow(new java.io.IOException("Test IO Exception"));

        assertThatThrownBy(() -> quizService.importQuestions("Desc", "Title", 100L, mockFile, true))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to import questions");
    }
}
