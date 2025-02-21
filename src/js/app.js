import { supabase } from './services/supabase.js';
import { Program } from './models/Program.js';
import { Request } from './models/Request.js';
import { Phase } from './models/Phase.js';
import { Milestone } from './models/Milestone.js';
import { Task } from './models/Task.js';

// State management
let currentUser = null;
let currentProgram = null;
let currentRequest = null;

// Add this helper function at the top of your file
function getRedirectUrl() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    return isLocalhost 
        ? window.location.origin 
        : 'https://kbogers.github.io/myteap/';
}

async function signIn(email) {
    try {
        const authContainer = document.getElementById('auth-container');
        const originalContent = authContainer.innerHTML;
        authContainer.innerHTML = '<div>Sending magic link...</div>';
        
        const { error } = await supabase.auth.signInWithOtp({ 
            email,
            options: {
                emailRedirectTo: getRedirectUrl()
            }
        });
        // ...existing code...
    } catch (error) {
        console.error('Authentication error:', error);
        alert('Authentication error: ' + error.message);
    }
}

async function signInWithGoogle() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getRedirectUrl()
            }
        });
        // ...existing code...
    } catch (error) {
        console.error('Google authentication error:', error);
        alert('Authentication error: ' + error.message);
    }
}

// UI Rendering
async function renderPrograms() {
    try {
        const programs = await Program.getAll();
        const container = document.getElementById('programs-container');
        container.innerHTML = `
            <div class="programs-header">
                <h2>Programs</h2>
                <button onclick="showNewProgramForm()">New Program</button>
            </div>
            <div class="programs-grid">
                ${programs.map(program => `
                    <div class="program-card" data-program-id="${program.id}">
                        <div class="program-card-content">
                            <h3>${program.name}</h3>
                            <p>${program.description || ''}</p>
                        </div>
                        <button onclick="window.showProgramDetails('${program.id}')">View Requests</button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error fetching programs:', error);
    }
}

async function showProgramDetails(programId) {
    try {
        currentProgram = await Program.getById(programId);
        const requests = await Request.getAllForProgram(programId);
        console.log('Loaded requests:', requests);
        
        const container = document.getElementById('programs-container');
        container.innerHTML = `
            <div class="program-nav">
                <button onclick="renderPrograms()" class="back-button">
                    <span class="material-icons">arrow_back</span>
                </button>
                <h4>${currentProgram.name}</h4>
                <button onclick="showNewRequestForm()" class="new-request-button">New Request</button>
            </div>
            <div class="table-container" style="margin: 1rem 0;">
                <table id="requestsTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Physician</th>
                            <th>Institution</th>
                            <th>Country</th>
                            <th>Owner</th>
                            <th>Phase</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requests.map(request => `
                            <tr>
                                <td>${request.id}</td>
                                <td>${request.physician}</td>
                                <td>${request.institution}</td>
                                <td>${request.country}</td>
                                <td>${request.owner}</td>
                                <td>${request.current_phase?.name || 'N/A'}</td>
                                <td>
                                    <button class="icon-button open-panel-button" data-request-id="${request.id}">
                                        <span class="material-icons">chevron_right</span>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Initialize DataTable
        const dataTable = new simpleDatatables.DataTable("#requestsTable", {
            perPage: 10,
            perPageSelect: [5, 10, 15, 20, 25],
            labels: {
                placeholder: "Search requests...",
                perPage: "Requests per page",
                noRows: "No requests found",
            }
        });

        // Add click event listener after table is initialized
        document.querySelectorAll('.open-panel-button').forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const requestId = button.getAttribute('data-request-id');
                console.log('Button clicked with request ID:', requestId);
                if (requestId) {
                    openRequestPanel(requestId);
                }
            });
        });

    } catch (error) {
        console.error('Error showing program details:', error);
        alert('Error showing program details: ' + error.message);
    }
}

async function showNewRequestForm() {
    const container = document.getElementById('programs-container');
    container.innerHTML = `
        <h2>New Request for ${currentProgram.name}</h2>
        <button onclick="showProgramDetails(${currentProgram.id})">Back to Program</button>
        <form id="new-request-form" class="request-form">
            <div class="form-group">
                <label for="physician">Physician Name:</label>
                <input type="text" id="physician" required>
            </div>
            <div class="form-group">
                <label for="institution">Institution:</label>
                <input type="text" id="institution" required>
            </div>
            <div class="form-group">
                <label for="country">Country:</label>
                <input type="text" id="country" required>
            </div>
            <button type="submit">Create Request</button>
        </form>
    `;

    document.getElementById('new-request-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await Request.create({
                programId: currentProgram.id,
                physician: document.getElementById('physician').value,
                institution: document.getElementById('institution').value,
                country: document.getElementById('country').value,
                owner: currentUser.id
            });
            showProgramDetails(currentProgram.id);
        } catch (error) {
            console.error('Error creating request:', error);
            alert('Failed to create request: ' + error.message);
        }
    });
}

async function showAddTaskForm(milestoneId, requestId) {
    const taskForm = document.createElement('div');
    taskForm.className = 'task-form';
    taskForm.innerHTML = `
        <input type="text" id="taskTitle" placeholder="Task title" required>
        <input type="date" id="taskDueDate">
        <button onclick="addTask('${milestoneId}', '${requestId}')">Add</button>
        <button onclick="this.parentElement.remove()" class="cancel-btn">Cancel</button>
    `;
    
    const addTaskBtn = document.querySelector(`[onclick="showAddTaskForm('${milestoneId}', '${requestId}')"]`);
    addTaskBtn.parentElement.insertBefore(taskForm, addTaskBtn);
}

async function addTask(milestoneId, requestId) {
    try {
        const title = document.getElementById('taskTitle').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }

        await Task.create({
            milestoneId,
            title,
            dueDate: dueDate || null,
            assignee: currentUser.id
        });

        await openRequestPanel(requestId);
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task: ' + error.message);
    }
}

async function completeTask(taskId, requestId) {
    try {
        await Task.complete(taskId);
        await showRequestDetails(requestId);
    } catch (error) {
        console.error('Error completing task:', error);
        alert('Failed to complete task: ' + error.message);
    }
}

async function completeMilestone(milestoneId, requestId) {
    try {
        await Milestone.complete(milestoneId, requestId);
        await showRequestDetails(requestId);
    } catch (error) {
        console.error('Error completing milestone:', error);
        alert('Failed to complete milestone: ' + error.message);
    }
}

// Side panel functions
async function openRequestPanel(requestId) {
    try {
        console.log('Starting openRequestPanel for ID:', requestId);
        currentRequest = await Request.getById(requestId);
        console.log('Loaded request data:', currentRequest);
        
        const panel = document.getElementById('requestPanel');
        console.log('Found panel element:', panel);
        
        if (!panel) {
            console.error('Request panel element not found');
            return;
        }
        
        // Update panel content
        console.log('Updating panel tabs...');
        updatePhasesTab();
        updateDetailsTab();
        updateCommentsTab();
        
        console.log('Adding open class to panel');
        panel.classList.add('open');
        console.log('Panel should now be visible');
    } catch (error) {
        console.error('Error opening request panel:', error);
        alert('Error loading request details: ' + error.message);
    }
}

function closeRequestPanel() {
    const panel = document.getElementById('requestPanel');
    panel.classList.remove('open');
    currentRequest = null;
}

function updatePhasesTab() {
    const phasesTab = document.getElementById('phasesTab');
    phasesTab.innerHTML = currentRequest.phases.map(phase => `
        <div class="phase-card">
            <h4>${phase.name}</h4>
            <div class="milestones">
                ${phase.milestones.map(milestone => `
                    <div class="milestone ${milestone.completed_at ? 'completed' : ''}">
                        <div class="milestone-header">
                            <span>${milestone.name}</span>
                            ${!milestone.completed_at ? 
                                `<button onclick="completeMilestone('${milestone.id}', '${currentRequest.id}')">Complete</button>` 
                                : `<span class="completed-text"><span class="material-icons">check_circle</span>Completed</span>`
                            }
                        </div>
                        ${milestone.tasks && milestone.tasks.length > 0 ? `
                            <div class="tasks-container">
                                ${milestone.tasks.map(task => `
                                    <div class="task ${task.completed_at ? 'completed' : ''}">
                                        <div class="task-content">
                                            <div>
                                                <span>${task.title}</span>
                                                ${task.due_date ? `<span class="due-date">Due: ${new Date(task.due_date).toLocaleDateString()}</span>` : ''}
                                            </div>
                                            ${!task.completed_at ?
                                                `<button onclick="completeTask('${task.id}', '${currentRequest.id}')">Complete</button>`
                                                : `<span class="completed-text"><span class="material-icons">check</span></span>`
                                            }
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        <button class="add-task-btn" onclick="showAddTaskForm('${milestone.id}', '${currentRequest.id}')">
                            + Add Task
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function updateDetailsTab() {
    const detailsTab = document.getElementById('detailsTab');
    detailsTab.innerHTML = `
        <div class="info-grid">
            <div><strong>Physician:</strong> ${currentRequest.physician}</div>
            <div><strong>Institution:</strong> ${currentRequest.institution}</div>
            <div><strong>Country:</strong> ${currentRequest.country}</div>
            <div><strong>Owner:</strong> ${currentRequest.owner}</div>
            <div><strong>Current Phase:</strong> ${currentRequest.current_phase?.name || 'N/A'}</div>
            <div><strong>Created:</strong> ${new Date(currentRequest.created_at).toLocaleDateString()}</div>
        </div>
    `;
}

function updateCommentsTab() {
    // This will be implemented when we add comments functionality
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '<div class="comment-placeholder">Comments coming soon...</div>';
}

// Initialize tab switching
function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });
}

// Auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth event:', event);
    try {
        currentUser = session?.user || null;
        const welcomeBox = document.getElementById('welcome-box');
        
        if (currentUser) {
            await renderPrograms();
            if (welcomeBox) {
                welcomeBox.style.display = 'none';
            }
        } else {
            const container = document.getElementById('programs-container');
            container.innerHTML = `
                <div class="auth-message">
                    Please sign in to view programs
                </div>
            `;
            if (welcomeBox) {
                welcomeBox.style.display = 'block';
            }
        }
        
        initAuthUI();
    } catch (error) {
        console.error('Error handling auth state change:', error);
    }
});

// Initialize auth UI
function initAuthUI() {
    const authContainer = document.getElementById('auth-container');
    const modal = document.getElementById('signInModal');
    
    if (!currentUser) {
        authContainer.innerHTML = `
            <button onclick="signInWithGoogle()" class="google-button">
                <img src="https://www.google.com/favicon.ico" alt="Google" width="18" height="18">
                Continue with Google
            </button>
            <div class="auth-divider">
                <span>or</span>
            </div>
            <div class="auth-form">
                <input type="email" 
                       id="email" 
                       placeholder="Your email"
                       class="auth-input"
                       required>
                <button onclick="signIn(document.getElementById('email').value)"
                        class="auth-button">
                    Sign In with Email
                </button>
            </div>
        `;
    } else {
        authContainer.innerHTML = `
            <div class="user-info">
                <span class="user-email">${currentUser.email}</span>
                <button onclick="handleSignOut()" class="auth-button">Sign Out</button>
            </div>
        `;
    }
}

// Add modal control functions
function setupModalListeners() {
    console.log('Setting up modal listeners...');
    const modal = document.getElementById('signInModal');
    const userMenuButton = document.getElementById('userMenuButton');
    const closeModalButton = document.querySelector('.close-modal');

    console.log('Found elements:', {
        modal: modal?.id,
        userMenuButton: userMenuButton?.id,
        closeModalButton: !!closeModalButton
    });

    if (!modal || !userMenuButton || !closeModalButton) {
        console.error('Modal elements not found:', {
            modal: !!modal,
            userMenuButton: !!userMenuButton,
            closeModalButton: !!closeModalButton
        });
        return;
    }

    // Ensure modal starts hidden
    modal.classList.remove('show');

    userMenuButton.addEventListener('click', (e) => {
        console.log('User menu button clicked');
        e.preventDefault();
        modal.classList.add('show');
    });

    closeModalButton.addEventListener('click', (e) => {
        console.log('Close button clicked');
        e.preventDefault();
        modal.classList.remove('show');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            console.log('Clicked outside modal');
            modal.classList.remove('show');
        }
    });

    console.log('Modal listeners setup complete');
}

// Initialize app
function init() {
    console.log('Initializing app...');
    setupModalListeners();
    initAuthUI();
    setupTabListeners();
    console.log('App initialized.');
}

// Make functions available globally
function showNewProgramForm() {
    const container = document.getElementById('programs-container');
    container.innerHTML = `
        <h2>Create New Program</h2>
        <button onclick="renderPrograms()">Back to Programs</button>
        <form id="new-program-form" class="request-form">
            <div class="form-group">
                <label for="programName">Program Name:</label>
                <input type="text" id="programName" required>
            </div>
            <div class="form-group">
                <label for="description">Description:</label>
                <textarea id="description" rows="3" class="form-input"></textarea>
            </div>
            <div id="phases-container">
                <h3>Phases</h3>
                <div id="phases-list"></div>
                <button type="button" onclick="addPhaseInput()">Add Phase</button>
            </div>
            <button type="submit">Create Program</button>
        </form>
    `;

    document.getElementById('new-program-form').addEventListener('submit', handleProgramSubmit);
    addPhaseInput(); // Add first phase input by default
}

function addPhaseInput() {
    const phasesContainer = document.getElementById('phases-list');
    const phaseIndex = phasesContainer.children.length;
    
    const phaseDiv = document.createElement('div');
    phaseDiv.className = 'phase-input';
    phaseDiv.innerHTML = `
        <div class="form-group">
            <label>Phase ${phaseIndex + 1}</label>
            <input type="text" name="phase${phaseIndex}" placeholder="Phase Name" required>
            <div class="milestones-list"></div>
            <button type="button" onclick="addMilestoneInput(${phaseIndex})">Add Milestone</button>
        </div>
    `;
    
    phasesContainer.appendChild(phaseDiv);
    addMilestoneInput(phaseIndex); // Add first milestone input by default
}

function addMilestoneInput(phaseIndex) {
    const phase = document.querySelector(`[name="phase${phaseIndex}"]`).closest('.phase-input');
    const milestonesList = phase.querySelector('.milestones-list');
    const milestoneIndex = milestonesList.children.length;
    
    const milestoneDiv = document.createElement('div');
    milestoneDiv.className = 'milestone-input';
    milestoneDiv.innerHTML = `
        <input type="text" 
               name="phase${phaseIndex}milestone${milestoneIndex}" 
               placeholder="Milestone Name" 
               required>
        <label>
            <input type="checkbox" 
                   name="phase${phaseIndex}milestone${milestoneIndex}required" 
                   checked>
            Required
        </label>
    `;
    
    milestonesList.appendChild(milestoneDiv);
}

async function handleProgramSubmit(e) {
    e.preventDefault();
    try {
        // Create program
        const program = await Program.create({
            name: document.getElementById('programName').value,
            description: document.getElementById('description').value
        });

        // Create phases
        const phases = document.querySelectorAll('.phase-input');
        for (let i = 0; i < phases.length; i++) {
            const phase = phases[i];
            const phaseName = phase.querySelector(`[name="phase${i}"]`).value;
            
            const createdPhase = await Phase.create({
                programId: program.id,
                name: phaseName,
                sequence: i + 1
            });

            // Create milestones for this phase
            const milestones = phase.querySelectorAll('.milestone-input');
            for (let j = 0; j < milestones.length; j++) {
                const milestoneName = milestones[j].querySelector(`[name="phase${i}milestone${j}"]`).value;
                const isRequired = milestones[j].querySelector(`[name="phase${i}milestone${j}required"]`).checked;
                
                await Milestone.create({
                    phaseId: createdPhase.id,
                    name: milestoneName,
                    sequence: j + 1,
                    isRequired
                });
            }
        }

        await renderPrograms();
    } catch (error) {
        console.error('Error creating program:', error);
        alert('Failed to create program: ' + error.message);
    }
}

// Initialize all window/global functions in one place
function initializeGlobalFunctions() {
    console.log('Initializing global functions...');
    window.showNewProgramForm = showNewProgramForm;
    window.addPhaseInput = addPhaseInput;
    window.addMilestoneInput = addMilestoneInput;
    window.signIn = signIn;
    window.signInWithGoogle = signInWithGoogle;
    window.showProgramDetails = showProgramDetails;
    window.renderPrograms = renderPrograms;
    window.showNewRequestForm = showNewRequestForm;
    window.completeMilestone = completeMilestone;
    window.showAddTaskForm = showAddTaskForm;
    window.addTask = addTask;
    window.completeTask = completeTask;
    window.handleSignOut = handleSignOut;
    window.setupModalListeners = setupModalListeners;
    window.openRequestPanel = openRequestPanel;
    window.closeRequestPanel = closeRequestPanel;
    window.showRequestDetails = showRequestDetails;
    window.addComment = async function(requestId) {
        // This will be implemented when we add comments functionality
        console.log('Add comment clicked');
    };
    window.closeRequestPanel = closeRequestPanel;
    console.log('Global functions initialized.');
}

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM fully loaded, initializing app...');
        init();
    });
} else {
    init();
}
initializeGlobalFunctions();

function handleSignOut() {
    supabase.auth.signOut().then(() => {
        currentUser = null;
        renderPrograms();
    }).catch(error => {
        console.error('Error signing out:', error);
        alert('Error signing out: ' + error.message);
    });
}
window.handleSignOut = handleSignOut;

async function showRequestDetails(requestId) {
    try {
        currentRequest = await Request.getById(requestId);
        await openRequestPanel(requestId);
    } catch (error) {
        console.error('Error showing request details:', error);
        alert('Error showing request details: ' + error.message);
    }
}