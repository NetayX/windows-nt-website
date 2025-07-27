document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const desktop = document.getElementById('desktop');
    const loginForm = document.getElementById('login-form');
    const guestLoginButton = document.getElementById('guest-login');
    const windowsContainer = document.getElementById('windows-container');
    const taskbar = document.querySelector('.taskbar');

    const showDesktop = () => {
        loginScreen.style.display = 'none';
        desktop.style.display = 'block';
    };

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // Здесь должна быть логика аутентификации
        showDesktop();
    });

    guestLoginButton.addEventListener('click', () => {
        showDesktop();
    });

    desktop.addEventListener('click', (event) => {
        if (event.target.closest('.file-icon')) {
            const file = event.target.closest('.file-icon').dataset.file;
            openFile(file);
        }
    });

    let windowZIndex = 1;
    let windowOffset = 20; 
    
    const createWindow = (title, content) => {
        const windowDiv = document.createElement('div');
        windowDiv.classList.add('app-window');
        windowDiv.style.position = 'absolute';
        windowDiv.style.zIndex = windowZIndex++; 

        windowDiv.style.left = (100 + windowOffset) + 'px';
        windowDiv.style.top = (100 + windowOffset) + 'px';
        windowOffset = (windowOffset + 20) % 100; 

        const titleBar = document.createElement('div');
        titleBar.classList.add('title-bar');
        titleBar.innerHTML = `<div class="title-bar-text">${title}</div>
                             <div class="title-bar-controls">
                                 <button aria-label="Minimize">-</button>
                                 <button aria-label="Maximize">□</button>
                                 <button aria-label="Close">x</button>
                             </div>`;

        const windowBody = document.createElement('div');
        windowBody.classList.add('window-body');
        windowBody.innerHTML = content;

        windowDiv.appendChild(titleBar);
        windowDiv.appendChild(windowBody);
        windowsContainer.appendChild(windowDiv);

        const closeButton = titleBar.querySelector('[aria-label="Close"]');
        const minimizeButton = titleBar.querySelector('[aria-label="Minimize"]');
        const maximizeButton = titleBar.querySelector('[aria-label="Maximize"]');

        closeButton.addEventListener('click', () => {
            windowDiv.remove();

            const taskbarButton = document.querySelector(`[data-window-id="${windowDiv.id}"]`);
            if (taskbarButton) {
                taskbarButton.remove();
            }
        });

        minimizeButton.addEventListener('click', () => {
            windowDiv.style.display = 'none'; 

            const taskbarButton = document.querySelector(`[data-window-id="${windowDiv.id}"]`);
            if (taskbarButton) {
                taskbarButton.classList.add('active');
            }
        });

        maximizeButton.addEventListener('click', () => {
           if (windowDiv.classList.contains('maximized')) {
                windowDiv.classList.remove('maximized');
                windowDiv.style.top = '100px';
                windowDiv.style.left = '100px';
            } else {
                windowDiv.classList.add('maximized');
                windowDiv.style.top = '0';
                windowDiv.style.left = '0';
            }
        });

        const taskbarButton = document.createElement('button');
        taskbarButton.textContent = title;
        taskbarButton.dataset.windowId = windowDiv.id = `window-${Date.now()}`;
        taskbarButton.classList.add('taskbar-button');

        taskbarButton.addEventListener('click', () => {
            windowDiv.style.display = 'block'; 
            windowDiv.style.zIndex = windowZIndex++;
            taskbarButton.classList.remove('active');
        });

        taskbar.appendChild(taskbarButton);


        titleBar.addEventListener('mousedown', startDrag);

        let isDragging = false;
        let offsetX, offsetY;

        function startDrag(e) {
            isDragging = true;
            offsetX = e.clientX - windowDiv.offsetLeft;
            offsetY = e.clientY - windowDiv.offsetTop;

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        }

        function drag(e) {
            if (!isDragging) return;
            windowDiv.style.left = (e.clientX - offsetX) + 'px';
            windowDiv.style.top = (e.clientY - offsetY) + 'px';
        }

        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        }

        windowDiv.addEventListener('mousedown', () => {
            windowDiv.style.zIndex = windowZIndex++;
        });


        return windowDiv;
    };

    const openFile = async (file) => {
        let content = '';
        switch (file) {
            case 'news':
                content = await loadTextFile('files/news.txt');
                break;
            case 'rules':
                content = await loadTextFile('files/rules.txt');
                break;
            case 'table':
                content = await createTable('files/data.csv');
                break;
            default:
                content = '<p>Файл не найден.</p>';
        }

        createWindow(file.toUpperCase(), content);
    };

    const loadTextFile = async (url) => {
        const response = await fetch(url);
        return await response.text();
    };

    const createTable = async (csvUrl) => {
        const csvData = await loadTextFile(csvUrl);
        const rows = csvData.split('\n');
        const table = document.createElement('table');

        for (const row of rows) {
            const columns = row.split(',');
            const tr = document.createElement('tr');
            for (const column of columns) {
                const td = document.createElement('td');
                td.textContent = column;
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        return table.outerHTML; 
    };
});
