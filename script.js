var currentStoryIndex = 0; // Global variable to track the story index

document.getElementById('updateStoryForm').addEventListener('submit', submitUpdateForm);


document.addEventListener('DOMContentLoaded', function() {
  const alertElements = document.querySelectorAll('.alert.alert-dismissible');
  const restoreButton = document.getElementById('restoreToolTips');

  // Initialize alerts based on sessionStorage
  alertElements.forEach((alertElement, index) => {
    // Check if this alert was previously closed
    if (sessionStorage.getItem('alertClosed_' + index) === 'true') {
      alertElement.style.display = 'none';
    } else {
      alertElement.style.display = ''; // default or 'block' to ensure it's visible
    }
  });

  // Add event listeners for the close buttons of the alerts
  alertElements.forEach((alertElement, index) => {
    const closeButton = alertElement.querySelector('.btn-close');
    closeButton.addEventListener('click', function() {
      // Hide the alert and set the item in sessionStorage
      alertElement.style.display = 'none';
      sessionStorage.setItem('alertClosed_' + index, 'true');
    });
  });

  // Restore all alerts when the restore button is clicked
  restoreButton.addEventListener('click', function() {
    alertElements.forEach((alertElement, index) => {
      // Show the alert and remove the item from sessionStorage
      alertElement.style.display = ''; // default or 'block'
      sessionStorage.removeItem('alertClosed_' + index);
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
	initStepModal();
	initAssessmentModal();
	$('#userStoryModal').on('show.bs.modal', resetModal);
	$('#userStoryModal').on('hidden.bs.modal', resetModal);
	loadStoriesFromLocalStorage();
	document.getElementById('clear-stories-button').addEventListener('click', clearStoriesFromLocalStorage);
	var assessmentModalElement = document.getElementById('assessmentModal');
	var assessmentModal = new bootstrap.Modal(assessmentModalElement);
	var assessmentModalEl = document.getElementById('assessmentModal');
	var assessmentModal = new bootstrap.Modal(assessmentModalEl);

    // Add click event listener to the button with the ID 'openFirstStory'
    document.getElementById('openFirstStory').addEventListener('click', function() {
        // Show the modal
        assessmentModal.show();

        // Populate the modal with the first story's data
        populateModalWithStory(0);
    });
    document.querySelectorAll('.story-button').forEach(button => {
    	button.addEventListener('click', function() {
    		var storyIndex = this.getAttribute('data-story-index');
    		var modal = new bootstrap.Modal(document.getElementById('assessmentModal'));
    		modal.show();

        // Store the index in the modal's data attribute
        document.getElementById('assessmentModal').setAttribute('data-story-index', storyIndex);

        // Populate the modal with the story data
        populateModalWithStory(storyIndex);
    });
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
initAssessmentModal(); // Set up the modal event listeners
});


function generateUniqueId() {
	return '_' + Math.random().toString(36).substr(2, 9);
}

$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip(); 
});

// Save items, load and clear them
function saveStoriesToLocalStorage() {
	const allStories = [...document.querySelectorAll('.card')].map(card => {
		const stage = card.closest('.column') ? card.closest('.column').getAttribute('id') : 'list-prepare';
		const cardBody = card.querySelector('.card-body');
		const roleElement = cardBody.querySelector('.card-role');
		const activityElement = cardBody.querySelector('.card-activity');
		const needElement = cardBody.querySelector('.card-need');
		const outcomeElement = cardBody.querySelector('.card-outcome');
		const reachElement = cardBody.querySelector('.reach-value');
		const impactElement = cardBody.querySelector('.impact-value');
		const confidenceElement = cardBody.querySelector('.confidence-value');
		const effortElement = cardBody.querySelector('.effort-value');

        // Parse the values, ensuring that we have a fallback for each if not found
        const role = roleElement ? roleElement.textContent.trim() : '';
        const activity = activityElement ? activityElement.textContent.trim() : '';
        const need = needElement ? needElement.textContent.trim() : '';
        const outcome = outcomeElement ? outcomeElement.textContent.trim() : '';
        const reach = reachElement ? parseInt(reachElement.textContent, 10) : 0;
        const impact = impactElement ? parseFloat(impactElement.textContent) : 0;
        const confidence = confidenceElement ? parseFloat(confidenceElement.textContent) : 0;
        const effort = effortElement ? parseFloat(effortElement.textContent) : 0;
        const riceScore = (reach * impact * (confidence / 100)) / effort;

        return {
        	id: card.id,
        	stage: stage,
        	role: role,
        	activity: activity,
        	need: need,
        	outcome: outcome,
        	reach: reach,
        	impact: impact,
        	confidence: confidence,
        	effort: effort,
        	riceScore: isNaN(riceScore) ? null : riceScore.toFixed(),
            htmlContent: card.outerHTML // Assuming you want to save the whole card HTML
        };
    });

	localStorage.setItem('stories', JSON.stringify(allStories));
	console.log('Stories saved to localStorage:', allStories);
}

function loadStoriesFromLocalStorage() {
	const savedStories = JSON.parse(localStorage.getItem('stories') || '[]');
	console.log(`Loading ${savedStories.length} stories from localStorage`);

	  // Containers for the stages
	  const stages = {
	  	'list-prepare': document.getElementById('list-prepare'),
	  	'list-execute': document.getElementById('list-execute'),
	  	'list-monitor': document.getElementById('list-monitor'),
	  	'list-conclude': document.getElementById('list-conclude'),
	  };

	  savedStories.forEach(storyObj => {
	  	console.log('Processing story:', storyObj.id);

	    // Check if the card already exists in any stage, if so, remove it.
	    const existingCard = document.getElementById(storyObj.id);
	    if (existingCard) {
	    	console.log(`Removing existing card for story ${storyObj.id}`);
	    	existingCard.remove();
	    }

	    if (storyObj.htmlContent) {
	    	const tempDiv = document.createElement('div');
	    	tempDiv.innerHTML = storyObj.htmlContent;
	    	const story = tempDiv.querySelector('.card');

	    	if (story && storyObj.stage in stages) {
	    		console.log(`Appending story ${storyObj.id} to stage: ${storyObj.stage}`);
	    		stages[storyObj.stage].appendChild(story);
	    } else {
	    	console.error('Failed to parse a valid .card element from story object:', storyObj);
	    }
	} else {
		console.error('No htmlContent to parse for story object:', storyObj);
	}
});
  console.log('Finished loading stories from localStorage');
}

function refreshCardDisplays() {
// Assuming '.card' is the class for card elements
const cardElements = document.querySelectorAll('.card');

const allStories = JSON.parse(localStorage.getItem('stories')) || [];
    allStories.forEach(story => {
    	const card = document.getElementById(story.id);
        if (!card) return; // If the card doesn't exist in the DOM, skip it

        // Update the card elements with the new story information
        const roleElement = card.querySelector('.card-role');
        const activityElement = card.querySelector('.card-activity');
        const needElement = card.querySelector('.card-need');
        const outcomeElement = card.querySelector('.card-outcome');
        const riceBadge = card.querySelector('.badge-rice');

        // Update the text content of each element
        if (roleElement) roleElement.textContent = story.role;
        if (activityElement) activityElement.textContent = story.activity;
        if (needElement) needElement.textContent = story.need;
        if (outcomeElement) outcomeElement.textContent = story.outcome;
        
        // Update the RICE score
        if (riceBadge && story.riceScore !== null) {
        	riceBadge.textContent = `${story.riceScore}`;
        }
    });
}


// Delete all
function clearStoriesFromLocalStorage() {
	localStorage.removeItem('stories');

        // Clear the stories from the UI
        const allStories = document.querySelectorAll('.card');
        allStories.forEach(story => story.remove());
    }
    function showStep(stepNum) {
    	document.querySelectorAll('.step').forEach(function(step) {
    		step.style.display = 'none';
    	});
    	document.getElementById('step' + stepNum).style.display = 'block';
    }

// Delete one
function initStepModal() {
	showStep(1);

	document.querySelectorAll('.next-step').forEach(function(button) {
		button.addEventListener('click', function() {
			let nextStepNum = this.getAttribute('data-next');
			showStep(nextStepNum);
		});
	});

	document.querySelectorAll('.prev-step').forEach(function(button) {
		button.addEventListener('click', function() {
			let prevStepNum = this.getAttribute('data-prev');
			showStep(prevStepNum);
		});
	});
}

function initAssessmentModal() {
    // Initialize the assessmentModal with Bootstrap 5
    var assessmentModalEl = document.getElementById('assessmentModal');
    var assessmentModalInstance = new bootstrap.Modal(assessmentModalEl, {
    	keyboard: false,
        backdrop: 'static' // Optional: to prevent closing when clicking outside the modal
    });

    // Attach event listener for the delete button within the modal
    document.querySelectorAll('.story-button').forEach(button => {
    	button.addEventListener('click', function() {
    		var storyIndex = this.getAttribute('data-story-index');
    		var modal = new bootstrap.Modal(document.getElementById('assessmentModal'));
    		modal.show();

	        // Store the index in the modal's data attribute
	        document.getElementById('assessmentModal').setAttribute('data-story-index', storyIndex);

	        // Populate the modal with the story data
	        populateModalWithStory(storyIndex);
	    });
    });

    
    // Any other initialization logic for your modal can go here
}

// Add stories 
function getValueBadge(value) {
	switch (value) {
		case 'Critical':
		return '<span class="badge badge-critical" data-toggle="tooltip" data-placement="bottom" data-bs-theme="dark" title="Criticality">Critical</span>';
		case 'Adds Value':
		return '<span class="badge badge-adds-value" data-toggle="tooltip" data-placement="bottom" data-bs-theme="dark" title="Criticality">Adds Value</span>';
		default:
		return '';
	}
}

function getExperienceBadge(experience) {
	switch (experience) {
		case 'Impossible':
		return '<span class="badge badge-impossible" data-toggle="tooltip" data-placement="bottom" data-bs-theme="dark" title="Current experience">Impossible</span>';
		case 'Possible':
		return '<span class="badge badge-possible" data-toggle="tooltip" data-placement="bottom" data-bs-theme="dark" title="Current experience">Possible</span>';
		case 'Simple':
		return '<span class="badge badge-simple" data-toggle="tooltip" data-placement="bottom" data-bs-theme="dark" title="Current experience">Simple</span>';
		default:
		return '';
	}
}

function addItem() {
    const form = document.getElementById('list-form'); // Replace 'myFormId' with your form's ID

    const asAInput = document.getElementById('as-a');
    const whenInput = document.getElementById('when');
    const iWantInput = document.getElementById('i-want');
    const soThatInput = document.getElementById('so-that');
    const currentValueInput = document.querySelector('input[name="current-value"]:checked');
    const currentExperienceInput = document.querySelector('input[name="current-experience"]:checked');
    const stageInput = document.querySelector('input[name="stage"]:checked');

    const asA = asAInput.value.trim() || asAInput.placeholder;
    const when = whenInput.value.trim() || whenInput.placeholder;
    const iWant = iWantInput.value.trim() || iWantInput.placeholder;
    const soThat = soThatInput.value.trim() || soThatInput.placeholder;
    const currentImpact = currentValueInput ? currentValueInput.value : 'Critical';
    const currentExperience = currentExperienceInput ? currentExperienceInput.value : 'Impossible';

    const reach = parseInt(form.querySelector('.reach').value, 10) || 60;
    const impactElement = form.querySelector('input[name="impact"]:checked');
    const impact = impactElement ? parseFloat(impactElement.value) : 0;
    const confidence = parseFloat(form.querySelector('.confidence').value) || 0;
    const effort = parseInt(form.querySelector('.effort').value, 10) || 0;
    let riceScore = (reach && impact && confidence && effort) ? (reach * impact * confidence) / effort : 0;

    if (reach && impact !== null && confidence && effort) {
    	riceScore = (reach * impact * (confidence / 100)) / effort;
    }	


    if (stageInput) {
    	const card = document.createElement('div');
    	card.classList.add('card');
    	card.classList.add('card');
        card.setAttribute('draggable', 'true');  // Make the card draggable
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        // Generate a unique ID for the card
        const cardId = generateUniqueId();
        cardBody.innerHTML = `
        <div><span class="story-text">As a</span><span class='card-role story-response'>${asA}</span>
        <br><span class="story-text">when</span><span class='card-activity story-response'>${when}</span>
        <br><span class="story-text">I want</span><span class='card-need story-response'>${iWant}</span>
        <br><span class="story-text">so that</span><span class='card-outcome story-response'>${soThat}</span>
        </div>
        <div class="badge-footer">
        ${getValueBadge(currentImpact)}
        ${getExperienceBadge(currentExperience)}
        <span class="badge badge-rice" data-toggle="tooltip" data-placement="top" data-bs-theme="dark" title="Impact score">${riceScore.toFixed(0)}</span>
        </div>
		<span class="hidden reach-value">${reach}</span>
	    <span class="hidden impact-value">${impact}</span>
	    <span class="hidden confidence-value">${confidence}</span>
	    <span class="hidden effort-value">${effort}</span>
        `;
        card.appendChild(cardBody);

        // Set attributes to identify the stage and impact
        card.setAttribute('id', cardId);
        card.setAttribute('data-stage', stageInput.value.toLowerCase());
        card.setAttribute('data-impact', currentImpact.toLowerCase().replace(' ', '-'));

        // Add the event listener for the dragstart event
        card.addEventListener('dragstart', function(event) {
        	event.dataTransfer.setData('text/plain', event.target.id);
        });

        // Append the card to the corresponding list
        const listId = `list-${stageInput.value.toLowerCase()}`;
        document.getElementById(listId).appendChild(card);

        // Save the updated stories to local storage
        saveStoriesToLocalStorage();
        refreshCardDisplays();

        // Clear form inputs and reset to initial state
        asAInput.value = '';
        whenInput.value = '';
        iWantInput.value = '';
        soThatInput.value = '';
        currentValueInput.checked = false;
        currentExperienceInput.checked = false;
        form.reset();	    
    }
}

function updateStoryStage(storyId, newStage) {
	var savedStories = JSON.parse(localStorage.getItem('stories') || '[]');
	var storyIndex = savedStories.findIndex(story => story.id === storyId);

	if (storyIndex !== -1) {
	            savedStories[storyIndex].stage = newStage; // Update the stage
	            localStorage.setItem('stories', JSON.stringify(savedStories)); // Save the updated stories back to localStorage
	        } else {
	        	console.error('Story not found in saved stories');
	        }
	    }

	    function submitForm(event) {
		    event.preventDefault(); // Prevent the default form submission
		    const form = event.target;

		    addItem();
		    resetModal();

	    // Explicitly hide the modal by manipulating the display property and class
	    const modalElement = document.getElementById('userStoryModal');
	    if (modalElement) {
	        modalElement.style.display = 'none'; // Hide the modal by setting display to none
	        modalElement.classList.remove('show'); // Remove the 'show' class added by Bootstrap
	    }
	    
	    // Additionally, you might need to remove the modal backdrop
	    const modalBackdrop = document.querySelector('.modal-backdrop');
	    if (modalBackdrop) {
	    	modalBackdrop.remove();
	    }

	    // Optional: You might also want to remove the 'modal-open' class from the body
	    document.body.classList.remove('modal-open');
	}

	function resetModal() {
		document.getElementById('list-form').reset();
		showStep(1);
	}

// Update RICE
function getStoriesFromLocalStorage() {
    const storiesString = localStorage.getItem('stories');
    const stories = storiesString ? JSON.parse(storiesString) : [];
    console.log('Stories retrieved from local storage:', stories); // Should show an array of story objects
    return stories;
}

function populateModalWithStory(index) {
    const stories = getStoriesFromLocalStorage();
    const form = document.getElementById('updateStoryForm');

    // Check if the index is within the bounds of the stories array
    if (index >= 0 && index < stories.length) {
        const story = stories[index]; // Get the specific story using the index
        form.setAttribute('data-current-index', index.toString());

        // Show values from the stories
        document.getElementById('display-as-a').textContent = story.role || '';
        document.getElementById('display-when').textContent = story.activity || '';
        document.getElementById('display-i-want').textContent = story.need || '';
        document.getElementById('display-so-that').textContent = story.outcome || '';
        document.getElementById('display-rice').textContent = story.riceScore || '';

        // Populate the form with the story data
        document.getElementById('assess-as-a').value = story.role || '';
        document.getElementById('assess-when').value = story.activity || '';
        document.getElementById('assess-i-want').value = story.need || '';
        document.getElementById('assess-so-that').value = story.outcome || '';
        
        // Populate the solution input
        const solutionInput = document.getElementById('solution-input');
        solutionInput.value = story.solution || ''; // Prepopulate if it exists

        // Populate the RICE score inputs
        document.getElementById('reach-input').value = story.reach || 0;
        // document.getElementById('impact-input').value = story.impact || 0; // Assuming you have an input for impact
        document.getElementById('confidence-input').value = story.confidence || 0;
        document.getElementById('effort-input').value = story.effort || 0;

        // Set the correct radio button for 'impact' as checked
        if (story.impact) {
            const impactRadioBtn = document.querySelector(`input[name="impact"][value="${story.impact}"]`);
            if (impactRadioBtn) {
                impactRadioBtn.checked = true;
            } else {
                console.error('Impact radio button not found for value:', story.impact);
            }
        } else {
            // If there is no impact value, set a default (assuming "0" is your default value)
            const defaultImpactRadioBtn = document.querySelector('input[name="impact"][value="0"]');
            if (defaultImpactRadioBtn) {
                defaultImpactRadioBtn.checked = true;
            }
        }
    } else {
        console.error('populateModalWithStory: Index out of bounds', index);
    }
}

function updateModalNavigationButtons(index, totalStories) {
	document.getElementById('previousStory').disabled = index <= 0;
	document.getElementById('nextStory').disabled = index >= totalStories - 1;
}

function calculateRiceScore(reach, impact, confidence, effort) {
    // Ensure all values are present and are numbers; otherwise, return null
    if (!reach || !impact || !confidence || !effort) {
    	console.error('RICE score calculation error: Invalid input');
    	return null;
    }
    return ((reach * impact * (confidence/100)) / effort).toFixed();
}

function submitUpdateForm(event) {
    event.preventDefault(); // Prevent the default form submission
    const form = document.getElementById('updateStoryForm');
    const index = parseInt(form.getAttribute('data-current-index'), 10);

    if (isNaN(index)) {
        console.error('Invalid story index:', index);
        return; // Exit the function because the index is not valid
    }

    const reach = parseInt(form.querySelector('.reach').value) || 0;
    const impactElement = form.querySelector('input[name="impact"]:checked');
    const impact = impactElement ? parseFloat(impactElement.value) : 0;
    const confidence = parseFloat(form.querySelector('.confidence').value) || 0;
    const effort = parseInt(form.querySelector('.effort').value) || 0;
    const riceScore = calculateRiceScore(reach, impact, confidence, effort);

    const updatedStory = {
        role: form.querySelector('#assess-as-a').value,
        activity: form.querySelector('#assess-when').value,
        need: form.querySelector('#assess-i-want').value,
        outcome: form.querySelector('#assess-so-that').value,
        reach: reach,
        impact: impact,
        confidence: confidence,
        effort: effort,
        riceScore: parseFloat(riceScore)
    };

    let stories = JSON.parse(localStorage.getItem('stories')) || [];
    if (index >= 0 && index < stories.length) {
        stories[index] = { ...stories[index], ...updatedStory };
        localStorage.setItem('stories', JSON.stringify(stories));

        // Update the hidden values in the DOM
        const cardToUpdate = document.querySelector(`.card[id="${stories[index].id}"]`);
        if (cardToUpdate) {
            cardToUpdate.querySelector('.reach-value').textContent = updatedStory.reach;
            cardToUpdate.querySelector('.impact-value').textContent = updatedStory.impact;
            cardToUpdate.querySelector('.confidence-value').textContent = updatedStory.confidence;
            cardToUpdate.querySelector('.effort-value').textContent = updatedStory.effort;
            document.getElementById('display-rice').textContent = updatedStory.riceScore;
        } else {
            console.error('Card to update not found. Story ID:', stories[index].id);
        }

        // Show the success toast if you have one set up
        // var successToastElement = document.getElementById('successToast');
        // var successToast = new bootstrap.Toast(successToastElement);
        // successToast.show();

        // Hide the modal and refresh the display
        $('#userStoryModal').modal('hide');
        refreshCardDisplays(); // Make sure this function reflects the changes in the DOM
        saveStoriesToLocalStorage(stories); // This function should save the entire stories array back to localStorage
    } else {
        console.error('Index out of bounds when trying to update a story:', index);
    }
    saveStoriesToLocalStorage();
}


const strategy_mvp = (stories) => {
    // Sorting logic for the MVP strategy
    const metStories = stories.filter(story => story.status === 'possible' || story.status === 'simple');
    const unmetStories = stories.filter(story => story.status === 'impossible');

    const sortFunction = (a, b) => {
        if (a.scope !== b.scope) {
            return a.scope === 'critical' ? -1 : 1;
        }
        return b.riceScore - a.riceScore;
    };

    metStories.sort(sortFunction);
    unmetStories.sort(sortFunction);

    return [...metStories, ...unmetStories];
};

function sortUserStories(stories, strategy) {
    return strategy(stories);
}

function updateUserStoryUI(sortedStories) {
    console.log("Sorted stories:", sortedStories); // Check the sorted stories

    const storiesContainer = document.getElementById('sortedStoriesContainer');
    storiesContainer.innerHTML = '';

    sortedStories.forEach(story => {
        const storyElement = document.createElement('div');
        storyElement.className = 'story';
        storyElement.textContent = `Story: ${story.title}`; // Adjust to your story properties
        storiesContainer.appendChild(storyElement);
    });
}



// Event listener for the 'Create Roadmap' button
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('createRoadmap').addEventListener('click', function() {
        let userStories = getStoriesFromLocalStorage();
        let sortedStories = sortUserStories(userStories, strategy_mvp);
        updateUserStoryUI(sortedStories);
    });
});




// PAGINATION
document.getElementById('previousStory').addEventListener('click', function() {
    // Assuming you store the current index in a variable or a form attribute
    const stories = getStoriesFromLocalStorage();
    let currentIndex = parseInt(document.getElementById('updateStoryForm').getAttribute('data-current-index'), 10);
    if (currentIndex > 0) {
    	currentIndex--;
    	populateModalWithStory(currentIndex);
    }
});

document.getElementById('nextStory').addEventListener('click', function() {
	let currentIndex = parseInt(document.getElementById('updateStoryForm').getAttribute('data-current-index'), 10);
	const stories = getStoriesFromLocalStorage();
	if (currentIndex < stories.length - 1) {
		currentIndex++;
		populateModalWithStory(currentIndex);
	}
});

// JavaScript to listen for changes on radio inputs and change the border color of the parent wrapper
document.querySelectorAll('.radio-wrapper input[type="radio"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
    // Remove the custom border from all radio wrappers
    document.querySelectorAll('.radio-wrapper').forEach(function(wrapper) {
      wrapper.style.borderColor = ''; // or set to the default border color
    });

    // If this radio is checked, change the border color of its parent wrapper
    if (radio.checked) {
      radio.closest('.radio-wrapper').style.borderColor = 'var(--bs-info)';
    }
  });
});


document.addEventListener('DOMContentLoaded', function() {
var columns = document.querySelectorAll('.column'); // Assuming your columns have the class 'column'

// Set up the dragstart event for the cards
var cards = document.querySelectorAll('.card');
cards.forEach(function(card) {
	card.addEventListener('dragstart', function(event) {
		event.dataTransfer.setData('text/plain', card.id);
	});
});

// Set up the drop zones for the columns
columns.forEach(function(column) {
	column.addEventListener('dragover', function(event) {
        event.preventDefault(); // Allow for the card to be dropped
    });

	column.addEventListener('drop', function(event) {
		event.preventDefault();
		var id = event.dataTransfer.getData('text/plain');
		var card = document.getElementById(id);

		if (card instanceof Element) {
			var newStage = column.getAttribute('data-stage');
            card.setAttribute('data-stage', newStage); // Update the card's data-stage attribute
            column.appendChild(card);
            updateStoryStage(id, newStage); // Update the stage in localStorage
            saveStoriesToLocalStorage(); // Save the new state
            refreshCardDisplays();
        } else {
        	console.error('The card element is not valid:', card);
        }
    });
});
});
