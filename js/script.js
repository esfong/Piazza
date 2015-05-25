(function(window, document, undefined) {

	// Questions
	// Which button & input elements would be global in scope since don't you need to pull values later?
	// Do I need to make lower case

    // pane elements
    var rightPane = document.getElementById('right-pane');
	var leftPane = document.getElementById('left-pane');
	var interactors = document.getElementById('interactors');
	var questionsList = leftPane.querySelectorAll('div.question-info');

    // button and input elements
	var totalInput = getStoredQuestions();
	var selectedInput;

    // script elements that correspond to Handlebars templates
    var questionFormTemplate = document.getElementById('question-form-template');
	var questionsTemplate = document.getElementById('questions-template');
	var expandedQuestionTemplate = document.getElementById('expanded-question-template');

    // compiled Handlebars templates
    var templates = {
        renderQuestionForm: Handlebars.compile(questionFormTemplate.innerHTML),
		renderQuestionsTemplate: Handlebars.compile(questionsTemplate.innerHTML),
		renderExpandedQuestion: Handlebars.compile(expandedQuestionTemplate.innerHTML)
    };

    /* Returns the questions stored in localStorage. */
    function getStoredQuestions() {
        if (!localStorage.questions) {
            // default to empty array
            localStorage.questions = JSON.stringify([]);
        }

        return JSON.parse(localStorage.questions);
    }
	
    /* Store the given questions array in localStorage.
     *
     * Arguments:
     * questions -- the questions array to store in localStorage
     */
    function storeQuestions(questions) {
        localStorage.questions = JSON.stringify(questions);
    }
	
	// Render Question Form when page loads
    rightPane.innerHTML = templates.renderQuestionForm();

    // TODO: display question list initially (if there are existing questions)
	function loadQuestions() {
		leftPane.innerHTML = templates.renderQuestionsTemplate({questions: getStoredQuestions()});
	}
	
	loadQuestions();
	
	if (!localStorage.questions) {
		questionsTemplate.innerHTML = templates.renderQuestionsTemplate(getStoredQuestions());
 	}

 	

    // TODO: tasks 1-5 and one extension

	/* If responses exist for a specific question, load them */
 	function loadResponses(input) {
 		rightPane.innerHTML = templates.renderExpandedQuestion(input);
 	}
	
	/* Listen to clicks on leftPane and then load relevant question */
	leftPane.addEventListener('click', function(event) {
		var target = event.target;
		if (!target.getAttribute('id')) {
			target = target.parentNode;
		}
		var questionsListId = Number(target.getAttribute('id'));

		totalInput.filter(function(input) {
			if (input.id === questionsListId) {
				selectedInput = input;
				loadResponses(selectedInput);
			}
		});
	});
 	
	/* Listen to interactors and load new question form when button is clicked */
	interactors.querySelector('a').addEventListener('click', function(event) {
			rightPane.innerHTML = templates.renderQuestionForm();
	});

	/* Search box matching - case insensitive*/
	interactors.querySelector('input[name="search"]').addEventListener('keyup', function(event) {
			var searchInput = interactors.querySelector('input[name="search"]').value;
			var matchedQuestions = [];
			var formStatus = 0;
			if (searchInput) {
				var matchedQuestions = totalInput.filter(function(input) {
					return (input.question.toLowerCase().indexOf(searchInput.toLowerCase()) !== -1 
					|| input.subject.toLowerCase().indexOf(searchInput.toLowerCase()) !== -1);
				});
				leftPane.innerHTML = templates.renderQuestionsTemplate({questions: matchedQuestions});
			} else {
				loadQuestions();
			}
			if (selectedInput && searchInput) {
				var match = matchedQuestions.filter(function(object) {
					return (object.id == selectedInput.id)	
				});
				if (match.length == 0) {
					rightPane.innerHTML = templates.renderQuestionForm();
				}
			}

	});
	
	/* If someone is adding responses or a new question*/
	rightPane.addEventListener('submit', function(event) {
		event.preventDefault();
		var responseNameInput = document.getElementsByName('name')[0];
		var responseResponseInput = document.getElementsByName('response')[0];
		if (event.target.nodeName === 'FORM' && event.target.id === 'response-form') {
			if (responseNameInput.value && responseResponseInput.value) {
				var newResponseInput = {name: responseNameInput.value, response: responseResponseInput.value};
				selectedInput.responses.push(newResponseInput);
				storeQuestions(totalInput);
			}
			loadResponses(selectedInput);
			responseNameInput.value = '';
			responseResponseInput.value = '';
			newResponseInput = undefined;
		}
	 
		if (event.target.nodeName === 'FORM' && event.target.id === 'question-form') {
			var subjectInput = rightPane.querySelector('input[name="subject"]');
			var questionInput = rightPane.querySelector('textarea[name="question"]');
			if (subjectInput.value && questionInput.value) {
				var newInput = {subject: subjectInput.value, question: questionInput.value, id: Math.random(), responses: []};
				totalInput.push(newInput);
				storeQuestions(totalInput);
			}
			loadQuestions();
			subjectInput.value = '';
			questionInput.value = '';
		}
	});
 
 	/* Resolving questions */
	rightPane.addEventListener('click', function(event) {
		if (event.target.nodeName === 'A' & event.target.className === 'resolve btn') {
			totalInput.filter(function(input) {
				if (input.id === selectedInput.id) {
					var removalIndex = totalInput.indexOf(input);
					totalInput.splice(removalIndex,1);
					storeQuestions(totalInput);
					loadQuestions();
					rightPane.innerHTML = templates.renderQuestionForm();
				}
			});
		}
	});

})(this, this.document);
