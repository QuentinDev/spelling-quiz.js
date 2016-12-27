(function($) {
	$.fn.quiz = function(quizJsonContent)
	{
		function Quiz(quizContainer, quizJsonContent) {
			this.quizContainer = quizContainer;
			this.quizJsonContent = quizJsonContent;
			this.quizObj = null;
			this.quizScore = null; //percentage of correct answers
			this.userCorrectAnswers = null; //number of correct answers
			this.userChoices = []; //user choices for each question

			this.loadQuizContent();
			this.displayQuizContent();
			this.registerQuizEvents();
		}

		Quiz.prototype.nextQuizStr = function(){
			var self = this;

			//to prevent spam click
			// self.toggleDisableNoErrorButton();
			self.unregisterQuizEvents();
			this.quizContainer.children('div.questionContainer').not(':hidden').fadeOut(1000, function(){
				// self.toggleDisableNoErrorButton();
				self.registerQuizEvents();
				$(this).next().fadeIn();

				//Increment question nbr
				$('#questionCount').html(parseInt($('#questionCount').html(), 10)+1);
			});
		};

		Quiz.prototype.loadQuizContent = function(){
			var self = this;

			//get the quiz content in the json file passed in param
			$.ajax({
				url: self.quizJsonContent,
				async: false,
				success: function (data) {
					self.quizObj = data;
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(textStatus);
					console.error(errorThrown);
				}
			});
		};

		Quiz.prototype.displayQuizContent = function(){
			var self = this;
			var quizId, questionContainer;
			$.each(this.quizObj, function(key, value){
				quizId = "quiz"+key;
				self.quizContainer.append(`<div id=${quizId} class=questionContainer></div>`);
				questionContainer = $(`#${quizId}`);

				//display sentanceif not null
				questionContainer.append(value.sentance !== null ? `<p class=quizSentence>${value.sentance}</p>` : '');

				//display instruction if not null
				questionContainer.append(value.instruction !== null ? `<p class=instruction>${value.instruction}</p>` : '');

				questionContainer.append(`<ul class="answers"></ul>`);
				$.each(value.answers, function(answerKey, answer){
					// $("#"+strId).append("<span id="+strKey+" class='quizLiAnswer quizLiAnswerActive'>"+answer+"</span> ");
					questionContainer.children('.answers').append(`<li id=${answerKey} class='quizLiAnswer quizLiAnswerActive'>${answer}</li>`);
				});
			});

			// Add title and button
			this.quizContainer.prepend(`<h3><span id='questionCount'>1</span>/${self.quizObj.length}</h3>`);
			// Hide all question containers except the first one
			this.quizContainer.children('div.questionContainer').not(':first').hide();
		};

		Quiz.prototype.registerQuizEvents = function(){
			var self = this;
			$('.quizLiAnswer').click(function(){
				self.saveUserChoice($(this));
				if(self.checkQuizProgress()) {
					console.log($(this));
					$(this).toggleClass('quizLiAnswerSelected');//Select effect
					self.nextQuizStr();
				}else{
					self.endQuiz();
				}
			});
		};

		Quiz.prototype.unregisterQuizEvents = function() {
			$('#noErrorButton,.quizLiAnswer').off();
		};

		Quiz.prototype.saveUserChoice = function(elem){
			this.userChoices.push(elem.attr('id'));
		};

		Quiz.prototype.checkQuizProgress = function(){
			return $('#questionCount').html() < this.quizObj.length;
		};

		Quiz.prototype.endQuiz = function(){
			//$('.quizLiAnswer').removeClass('quizLiAnswerActive');

			//Remove all event handlers
			this.unregisterQuizEvents();

			$('#quiz-container').empty();

			this.getFinalResult();

			$('#quiz-container').append(`<p class="quizResult">Votre score est de ${this.quizScore}% (${this.userCorrectAnswers} / ${this.quizObj.length})</p>`);
		};

		Quiz.prototype.getFinalResult = function() {
			var self = this;
			$.each(this.quizObj, function(key, value){
				self.userCorrectAnswers += value.correctAnswer == self.userChoices[key];
			});

			//Get the percentage of correct answers
			this.quizScore = Math.round((this.userCorrectAnswers / this.quizObj.length) * 100);

			return;
		};

		Quiz.prototype.toggleDisableNoErrorButton = function() {
			if($('#noErrorButton').is(':disabled')){
				$('#noErrorButton').attr('disabled', false);
			}else{
				$('#noErrorButton').attr('disabled', 'disabled');
			}
		};

		return new Quiz($(this), quizJsonContent);
	};

})(jQuery);
