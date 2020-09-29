let questionsObject = questionsExt.slice();
let choosenQuestions = [];
let answeredQuestionsByIndex = [];
let darkmode=false;
landingPageVue();


function landingPageVue()
{   
    questionsObject = questionsExt.slice();
    choosenQuestions = [];


    if(answeredQuestionsByIndex.length == questionsObject.length)
    {
        if(confirm('Sie haben bereits alle Fragen beantwortet. Von neuem starten?'))
            answeredQuestionsByIndex = [];
    }
    
    
    
    
    var landingPageVue = new Vue(
        {
            el: '#vueInsert',

            data:
            {
                numberInput: '',
            },

            computed:
            {
                placeholderNumber: function()
                {
                    return ('1-'+(questionsObject.length-answeredQuestionsByIndex.length));
                }
            },

            methods:
            {
                checkIfInRange: function()
                {
                    if(this.numberInput>0 && this.numberInput<=(questionsObject.length-answeredQuestionsByIndex.length))
                        return true;
                    
                    else 
                    {
                        this.numberInput='';
                        return false;
                    }
                }
            },

            template:
            `
            <div id="vueInsert">
                <div class="container">
                <div class="row mt-5">
                <div class="col-12 text-center">
                    <h3>Willkommen zum Test Simulator</h3>
                    <h5>(prod. by PCP)</h5>
                </div>
                </div>
        
                <div class="row mt-5">
                <div class="col-12 text-center">
                    <form>
                    <div class="form-group">
                        <div class="row">
                            <div class="col-lg-6 col-12 my-auto">
                                <label for="numberOfQuestions">Anzahl der gewünschten Fragen?</label>
                            </div>
                            <div class="col-lg-2 offset-2 col-4">
                                <input 
                                    type="number" min="1" name="numberOfQuestions" 
                                    class="form-control text-center" id="numberOfQuestionsInput" 
                                    v-bind:placeholder="placeholderNumber" 
                                    v-model="numberInput"
                                    @change="checkIfInRange()" 
                                >
                            </div>
                            <div class="col-lg-2 col-4">
                            <button type="button" class="btn btn-block btn-info" id="submitButton" onclick="onSubmitForm()" :disabled="!checkIfInRange()">Start</button>
                            </div>
                        </div>
                    </div>
        
                    <div class="form-group mt-5" id="excludeContainer">
                        <label for="excludedQuestions">Welche Fragen wollen Sie <strong>exludieren</strong>?</label>
                        <small class="form-inline mb-2">Multiple Auswahl mit STRG möglich</small>
                        <select multiple class="form-control" name="excludedQuestions" id="excludedQuestionsID" size="20">
                        </select>
                    </div>
                    </form>
                </div>
                </div>
            </div>

            </div>
          `
        }
    );



    fillArray();

    //Fill excludedQuestions Selector with Questions
    function fillArray() 
    {
        questionsObject.forEach((element) => {
            let selector = document.getElementById('excludedQuestionsID');
            var option = document.createElement("option");
            option.text = element.question;
            option.value= element.index;
            selector.add(option);
        });

        //select already answered Questions
        answeredQuestionsByIndex.forEach(el => {
            $(`.form-control option[value=${el}]`).attr('selected','selected');
        });

    }
}


function checkIfValid(domElement)
{
    if(parseInt(domElement.value)>0 && parseInt(domElement.value)<=questionsObject.length)
        document.getElementById('submitButton').disabled = false;

    else
        document.getElementById('submitButton').disabled = true;
}




function onSubmitForm()
{
    let numberOfQuestions = document.getElementById('numberOfQuestionsInput').value;
    let excludedQuestionIds = [];

    $.each($("#excludedQuestionsID option:selected"), function() {
        excludedQuestionIds.push($(this).val())
    });


    //clear unselected Questions
    for(var i=0; i<questionsObject.length; i++)
        for(var j=0; j<excludedQuestionIds.length; j++)
            if(i==parseInt(excludedQuestionIds[j])) 
                questionsObject[i]='';

    questionsObject = questionsObject.filter(Boolean);

    choosenQuestions = randomQuestion(questionsObject, numberOfQuestions);

    startVue(choosenQuestions);





    function randomQuestion(array, numberOfQuestions)
    {
        let questionIdArray = [];
        let returnArray = [];   
        
        for(var i=0; i<numberOfQuestions; i++)
        {
            let rand = parseInt(Math.random()*array.length);

            //if existing question skip
            if(!questionIdArray.includes(rand))
            {
                returnArray.push(array[rand]);
                questionIdArray.push(rand);
            }

            else
                i = i-1;
        }
        return returnArray;
    }
}











function startVue(choosenQuestionsArray)
{
    var questionVue = new Vue(
    {
        el: '#vueInsert',

        data:
        {
            askedQuestionIds: [],
            vueAnswerFieldDirty: false,
            showInfoField:false,

            askedQuestions: [],

            answers: [],
            questionCounter: 0,
            
            vueAnswerField: '',

            finished: false,
        },

        methods:
        {           
            submitAnswer: function()
            {
                if(this.vueAnswerFieldValid)
                {
                    this.questionCounter++;
                    this.answers.push(this.vueAnswerField);
                    this.vueAnswerField = '';
    
                    if(this.questionCounter==this.questions.length)
                        this.finished=true;
    
                    this.vueAnswerFieldDirty= false;
                    this.showInfoField=false;
                }

                else
                {
                    alert('Eingabe erforderlich.')
                }
                
                

            },

            resetSite: function()
            {
                this.askedQuestionIds.forEach(el => {
                    answeredQuestionsByIndex.push(el);
                });
                landingPageVue();
            },
        },

        computed:
        {
            questions: function ()
            {
                let arr = [];

                choosenQuestionsArray.forEach(el => {
                    arr.push(el.question);
                    this.askedQuestionIds.push(el.index);
                });

                return arr;
            },

            templateAnswers: function()
            {
                let arr = [];
                let correctSolutions = [];
                

                questionsObject.forEach((element,i) => {
                    for(var x=0; x<this.askedQuestionIds.length; x++)
                        if(this.askedQuestionIds[x]==element.index)
                            correctSolutions.push(questionsObject[i])
                });

                correctSolutions.forEach((el,i) => {
                    this.askedQuestions.push(el.question)
                    correctSolutions[i]=el.answer;
                });


                correctSolutions.forEach((el,i) => {
                    arr.push({
                        template: this.answers[i],
                        solution: correctSolutions[i],
                    });
                });
                return arr;
            },

            vueAnswerFieldValid: function()
            {
                if(this.vueAnswerField.length==0)
                    return false;

                else 
                {
                    this.showInfoField=false;
                    return true;
                }
                    
            },
        },

        template:
        `<div id="vueInsert">
            <div class="container" id="maincontainer" v-if="!finished">
                <div class="row">
                    <div class="col-12 mt-5 text-center"><h3 style="text-decoration: underline">Frage {{questionCounter+1}}:<h3></div>
                    <div class="col-12 mt-2 text-center"><h5>{{questions[questionCounter]}}<h5></div>
                </div>
                
                <div class="row">
                    <div class="col-12 mt-5 text-center">
                        <div class="form-group">
                            <label for="answer" class="text-left">Antwort:</label>
                            
                            <textarea 
                                class="form-control answerField" 
                                v-model="vueAnswerField" 
                                v-bind:class="{fieldNotValid: (!vueAnswerFieldValid && vueAnswerFieldDirty)}" 
                                v-on:click="vueAnswerFieldDirty=true;" 
                                rows="8" 
                                id="answer"
                                name="answer" 
                                placeholder="Ihre Antwort hier...">
                            </textarea>

                            
                            <button 
                                class="btn btn-secondary mt-2" 
                                id="infoButton" 
                                v-bind:class="{infoButtonHidden: (vueAnswerFieldValid && vueAnswerFieldDirty)}"
                                v-on:click="showInfoField==true ? showInfoField=false : showInfoField=true"
                            ></button>

                            <div
                                v-if="showInfoField"
                                id="infoField"
                            >Um die Aufgabe abschließen zu können müssen Sie einen Text in das Feld eingeben.
                            </div>




                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="offset-lg-4 col-lg-4 offset-md-3 col-md-5 offset-sm-2 col-sm-8 offset-0 col-12">
                        <button class="btn btn-secondary btn-block" :disabled="!vueAnswerFieldDirty" v-on:click="submitAnswer()">Abgeben</button>
                    </div>
                </div>
            </div>






            <div class="container" id="maincontainer" v-if="finished">
                <div class="row">
                    <div class="col-12 mt-5 text-center">
                        <h3><u>Sie haben alle Fragen beantwortet</u></h3>
                    </div>

                    <div class="offset-lg-2 col-lg-8 offset-0 col-12 text-left mt-2">
                        <ol><li class="questionListItem" v-for="question in askedQuestions">{{question}}</li></ol>
                    </div>

                    <div class="col-12 mt-2">
                        <hr>
                    </div>
                </div>

                <div class="row mt-5 mx-lg-5 mx-md-3 mx-0" v-for="(answer, index) in templateAnswers">
                    <div class="col-12"><strong>{{askedQuestions[index]}}</strong></div>
                    <div class="col-12"><small>Ihre Antwort:</small></div>
                    <div class="col-12 form-control answerList">{{answer.template}}<br><br></div>

                    <div class="col-12 mt-3"><small>Musterantwort:</small></div>
                    <div class="col-12 form-control answerList">{{answer.solution}}<br><br></div>
                </div>




                <div class="row text-center mb-4 mx-5">
                    <div class="offset-lg-4 col-lg-4 offset-md-3 col-md-5 offset-sm-2 col-sm-8 offset-0 col-12">
                        <button class="btn btn-success" v-on:click="resetSite()">Nochmal?</button>
                    </div>
                </div>
            </div>


        </div>`,
    });
}







function toggleDarkMode() 
{
    if(!darkmode)
    {
        $('head').append('<link rel="stylesheet" type="text/css" href="css/darkmode.css" id="darkModeLink">');
        darkmode = true;
    }

    else
    {
        $('#darkModeLink').remove();
        darkmode = false;
    }
}









