document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const desktop = document.getElementById('desktop');
    const loginForm = document.getElementById('login-form');
    const guestLoginButton = document.getElementById('guest-login');
    const windowsContainer = document.getElementById('windows-container');
    const taskbar = document.querySelector('.taskbar');

    // Функция для отображения рабочего стола и скрытия экрана входа
    const showDesktop = () => {
        loginScreen.style.display = 'none';
        desktop.style.display = 'block';
    };

    // Обработчик отправки формы входа
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // Здесь должна быть логика аутентификации
        // В этом примере просто переходим к рабочему столу
        showDesktop();
    });

    // Обработчик входа как гость
    guestLoginButton.addEventListener('click', () => {
        showDesktop();
    });

    // Обработчик кликов по иконкам файлов
    desktop.addEventListener('click', (event) => {
        if (event.target.closest('.file-icon')) {
            const file = event.target.closest('.file-icon').dataset.file;
            openFile(file);
        }
    });

    // Функция для создания окна приложения
    let windowZIndex = 1; // Для управления порядком окон

    const createWindow = (title, content) => {
        const windowDiv = document.createElement('div');
        windowDiv.classList.add('app-window');
        windowDiv.style.position = 'absolute';
        windowDiv.style.zIndex = windowZIndex++; // Устанавливаем z-index

        const titleBar = document.createElement('div');
        titleBar.classList.add('title-bar');
        titleBar.innerHTML = `<div class="title-bar-text">${title}</div>
                             <div class="title-bar-controls">
                                 <button aria-label="Minimize">-</button>
                                 <button aria-label="Close">x</button>
                             </div>`;

        const windowBody = document.createElement('div');
        windowBody.classList.add('window-body');
        windowBody.innerHTML = content;

        windowDiv.appendChild(titleBar);
        windowDiv.appendChild(windowBody);
        windowsContainer.appendChild(windowDiv);

        // Добавляем обработчики событий для кнопок
        const closeButton = titleBar.querySelector('[aria-label="Close"]');
        const minimizeButton = titleBar.querySelector('[aria-label="Minimize"]');

        closeButton.addEventListener('click', () => {
            windowDiv.remove();
            // Удаляем кнопку из панели задач
            const taskbarButton = document.querySelector(`[data-window-id="${windowDiv.id}"]`);
            if (taskbarButton) {
                taskbarButton.remove();
            }
        });

        minimizeButton.addEventListener('click', () => {
            windowDiv.style.display = 'none'; // Свернуть окно
            // Подсвечиваем кнопку на панели задач
            const taskbarButton = document.querySelector(`[data-window-id="${windowDiv.id}"]`);
            if (taskbarButton) {
                taskbarButton.classList.add('active');
            }
        });

        // Добавляем кнопку на панель задач
        const taskbarButton = document.createElement('button');
        taskbarButton.textContent = title;
        taskbarButton.dataset.windowId = windowDiv.id = `window-${Date.now()}`; // Уникальный ID
        taskbarButton.classList.add('taskbar-button');

        taskbarButton.addEventListener('click', () => {
            windowDiv.style.display = 'block'; // Развернуть окно
            windowDiv.style.zIndex = windowZIndex++;
            windowDiv.classList.remove('active');
        });

        taskbar.appendChild(taskbarButton);


        // Сделаем перетаскиваемым
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

        // Обработчик кликов по окну для перемещения на передний план
        windowDiv.addEventListener('mousedown', () => {
            windowDiv.style.zIndex = windowZIndex++;
        });


        return windowDiv;
    };

    // Функция для открытия файла
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

    // Функция для загрузки текстового файла
    const loadTextFile = async (url) => {
        const response = await fetch(url);
        return await response.text();
    };

    // Функция для создания таблицы из CSV
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

        return table.outerHTML; // Возвращаем HTML таблицы
    };
});
