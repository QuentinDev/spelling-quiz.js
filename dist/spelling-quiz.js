(function($) {
	$.fn.quiz = function()
	{
		function Quiz(quizContainer) {
			this.quizContainer = quizContainer;
			this.quizObj = null;
			this.quizScore = null; //percentage of correct answers
			this.userCorrectAnswers = null; //number of correct answers
			this.userChoices = {}; //user choices for each question

			this.loadQuizContent();
			this.displayQuizContent();
			this.registerQuizEvents();
		}

		Quiz.prototype.nextQuizStr = function(){
			var self = this;

			//to prevent spam click
			self.toggleDisableNoErrorButton();
			self.unregisterQuizEvents();
			this.quizContainer.children('p').not(':hidden').fadeOut(1000, function(){
				self.toggleDisableNoErrorButton();
				self.registerQuizEvents();
				$(this).next().fadeIn();

				//Increment question nbr
				$('#questionCount').html(parseInt($('#questionCount').html(), 10)+1);
			});
		};

		Quiz.prototype.loadQuizContent = function(){
			var self = this;
			$.ajax({
				url: "app/quiz-content.json",
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
			$.each(this.quizObj, function(key, value){
				var strId = "str"+key;
				self.quizContainer.append("<p id="+strId+" class='quizSentence'></p>");

				$.each(value.str.split(" "), function(strKey, word){
					$("#"+strId).append("<span id="+strKey+" class='quizSpanElement quizSpanElementActive'>"+word+"</span> ");
				});
			});

			//Add title and button
			this.quizContainer.prepend("<h3>Question : <span id='questionCount'>1</span> / "+self.quizObj.length+"</h3>");
			this.quizContainer.append("<button id='noErrorButton'>Il n'y a pas de faute</button>");

			//Hide all sentances except the first one
			this.quizContainer.children('p').not(':first').hide();
		};

		Quiz.prototype.registerQuizEvents = function(){
			var self = this;
			$('#noErrorButton,.quizSpanElement').click(function(){
				self.saveUserChoice($(this));
				if(self.checkQuizProgress()) {
					self.nextQuizStr();
				}else{
					self.endQuiz();
				}


			});

			//Click event on each word span
			$('.quizSpanElement').click(function(){
				if(self.checkQuizProgress()) {
					$(this).toggleClass('quizSpanElementHover');//Select effect
				}
			});
		};

		Quiz.prototype.unregisterQuizEvents = function() {
			$('#noErrorButton,.quizSpanElement').off();
		};

		Quiz.prototype.saveUserChoice = function(elem){
			//If button is clicked insert false as answer else, insert clicked span id
			this.userChoices[$('.quizSentence:visible').attr('id')] = isNaN(elem.attr('id')) ? false : elem.attr('id');
		};

		Quiz.prototype.checkQuizProgress = function(){
			return $('#questionCount').html() < this.quizObj.length;
		};

		Quiz.prototype.endQuiz = function(){
			$('.quizSpanElement').removeClass('quizSpanElementActive');

			//Remove all event handlers
			this.unregisterQuizEvents();

			$('#quiz-container').empty();

			this.getFinalResult();

			$('#quiz-container').append('<p class="quizResult">Votre score est de '+this.quizScore+'% ('+this.userCorrectAnswers+' / '+this.quizObj.length+')</p>');
		};

		Quiz.prototype.getAllIndexes = function(arr, val) {
			var indexes = [], i;
			for(i = 0; i < arr.length; i++)
				if (arr[i] === val)
					indexes.push(i);
			return typeof indexes[0] !== "undefined" ? indexes : [false]; //returns false if answer is empty
		};

		Quiz.prototype.getFinalResult = function() {
			var self = this;
			$.each(this.quizObj, function(key, value){
				self.userCorrectAnswers += self.getAllIndexes(value.str.split(" "), value.mistake.name)[value.mistake.occurence] == self.userChoices["str"+key];
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

		return new Quiz($(this));
	};

})(jQuery);
