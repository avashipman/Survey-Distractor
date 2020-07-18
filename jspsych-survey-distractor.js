
jsPsych.plugins["survey-distractor"] = (function() {

    var plugin = {};
  
    jsPsych.pluginAPI.registerPreload('survey-distractor', 'stimulus', 'image');
  
    plugin.info = {
      name: 'survey-distractor',
      description: '',
      parameters: {
        questions: {
            type: jsPsych.plugins.parameterType.COMPLEX,
            array: true,
            pretty_name: 'Questions',
            default: undefined,
            nested: {
              prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: undefined,
                description: 'Prompt for the subject to response'
              },
              placeholder: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Value',
                default: "",
                description: 'Placeholder text in the textfield.'
              },
              rows: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Rows',
                default: 1,
                description: 'The number of rows for the response text box.'
              },
              columns: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Columns',
                default: 40,
                description: 'The number of columns for the response text box.'
              },
              required: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Required',
                default: false,
                description: 'Require a response'
              },
              name: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Question Name',
                default: '',
                description: 'Controls the name of data values associated with this question'
              }
            }
          },
        preamble: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Preamble',
          default: null,
          description: 'HTML formatted string to display at the top of the page above all the questions.'
        },
        button_label: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Button label',
          default: 'SUBMIT',
          description: 'The text that appears on the button to finish the trial.'
        },
        stimulus: {
          type: jsPsych.plugins.parameterType.IMAGE,
          pretty_name: 'Stimulus',
          default: undefined,
          description: 'The image to be displayed'
        },
        stimulus_height: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Image height',
          default: null,
          description: 'Set the image height in pixels'
        },
        stimulus_width: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Image width',
          default: null,
          description: 'Set the image width in pixels'
        },
        maintain_aspect_ratio: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Maintain aspect ratio',
          default: true,
          description: 'Maintain the aspect ratio after setting width or height'
        },
        choices: {
          type: jsPsych.plugins.parameterType.KEYCODE,
          array: true,
          pretty_name: 'Choices',
          default: jsPsych.ALL_KEYS,
          description: 'The keys the subject is allowed to press to respond to the stimulus.'
        },
        stimulus_duration: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Stimulus duration',
          default: null,
          description: 'How long to hide the stimulus.'
        },
        response_next_image: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Response goes to next image',
          default: true,
          description: 'If true, the next image will appear when subject makes a response.'
        }
      }
    }

    plugin.trial = function(display_element, trial) {

      display_element.innerHTML = '<div id="main_task-form"></div><div id="distractor-stimulus"></div>' 
      display_element_main_task = document.querySelector('#main_task-form')
      display_element_distractor = document.querySelector('#distractor-stimulus')

      for (var i = 0; i < trial.questions.length; i++) {
        if (typeof trial.questions[i].rows == 'undefined') {
          trial.questions[i].rows = 1;
        }
      }
      for (var i = 0; i < trial.questions.length; i++) {
        if (typeof trial.questions[i].columns == 'undefined') {
          trial.questions[i].columns = 40;
        }
      }
      for (var i = 0; i < trial.questions.length; i++) {
        if (typeof trial.questions[i].value == 'undefined') {
          trial.questions[i].value = "";
        }
      }

      var htmlSurvey = '';
      // show preamble text
      if(trial.preamble !== null){
        htmlSurvey += '<div id="main_task-preamble" class="main_task-preamble">'+trial.preamble+'</div>';
      }
      // start form
      htmlSurvey += '<form id="main_task-form">'

      // generate question order
      var question_order = [];
      for(var i=0; i<trial.questions.length; i++){
        question_order.push(i);
      }
      if(trial.randomize_question_order){
        question_order = jsPsych.randomization.shuffle(question_order);
      }

      // add questions
      for (var i = 0; i < trial.questions.length; i++) {
        var question = trial.questions[question_order[i]];
        var question_index = question_order[i];
        htmlSurvey += '<div id="main_task-'+question_index+'" class="main_task-question" style="margin: 2em 0em;">';
        htmlSurvey += '<p class="jspsych-survey-distractor">' + question.prompt + '</p>';
        var autofocus = i == 0 ? "autofocus" : "";
        var req = question.required ? "required" : "";
        if(question.rows == 1){
          htmlSurvey += '<input type="text" id="input-'+question_index+'"  name="#main_task-response-' + question_index + '" data-name="'+question.name+'" size="'+question.columns+'" '+autofocus+' '+req+' placeholder="'+question.placeholder+'"></input>';
        } else {
          htmlSurvey += '<textarea id="input-'+question_index+'" name="#main_task-response-' + question_index + '" data-name="'+question.name+'" cols="' + question.columns + '" rows="' + question.rows + '" '+autofocus+' '+req+' placeholder="'+question.placeholder+'"></textarea>';
        }
        htmlSurvey += '</div>';
      }

      // add submit button
      htmlSurvey += '<input type="submit" id="main_task-next" class="jspsych-btn main_task" value="'+trial.button_label+'"></input>';

      htmlSurvey += '</form>'
      display_element_main_task.innerHTML = htmlSurvey;

      //display distractor stimulus
      var htmlDistractor = '<img src="'+trial.stimulus+'" id="distractor-stimulus" style="';
      if(trial.stimulus_height !== null){
        htmlDistractor += 'height:'+trial.stimulus_height+'px; '
        if(trial.stimulus_width == null && trial.maintain_aspect_ratio){
          htmlDistractor += 'width: auto; ';
        }
      }
      if(trial.stimulus_width !== null){
        htmlDistractor += 'width:'+trial.stimulus_width+'px; '
        if(trial.stimulus_height == null && trial.maintain_aspect_ratio){
          htmlDistractor += 'height: auto; ';
        }
      }
      htmlDistractor +='"></img>';
      display_element_distractor.innerHTML = htmlDistractor;

      // store response
      var response = {
        rt: null,
        key: null
      };

      display_element_main_task.querySelector('#main_task-form').addEventListener('submit', function(e) {
        e.preventDefault();

        // create object to hold responses
        var question_data = {};
        
        for(var index=0; index < trial.questions.length; index++){
          var id = "Q" + index;
          var q_element = document.querySelector('#main_task-'+index).querySelector('textarea, input'); 
          var val = q_element.value;
          var name = q_element.attributes['data-name'].value;
          if(name == ''){
            name = id;
          }        
          var obje = {};
          obje[name] = val;
          Object.assign(question_data, obje);
        }

        // save data
        var trial_data = {
          "responses": JSON.stringify(question_data),
          "rt": response.rt,
          "stimulus": trial.stimulus,
          "key_press": response.key
        };

        display_element.innerHTML = '';

        // next trial
        jsPsych.finishTrial(trial_data);
      });

      // function to go to next stimulus
      var next_stimulus = function() {

        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        // kill keyboard listeners
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        // go to next stimulus
        htmlDistractor +='"></img>'
      }

      // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element_distractor.querySelector('#distractor-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_next_image) {
        next_stimulus();
      }

    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        persist: false,
        allow_held_key: false
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element_distractor.querySelector('#distractor-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    };
  
    return plugin;
  })();
