document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const desktop = document.getElementById('desktop');
    const loginForm = document.getElementById('login-form');
    const guestLoginButton = document.getElementById('guest-login');
    const windowsContainer = document.getElementById('windows-container');

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
    const createWindow = (title, content) => {
        const windowDiv = document.createElement('div');
        windowDiv.classList.add('app-window');
        windowDiv.style.position = 'absolute';

        // Сделаем перетаскиваемым
        windowDiv.addEventListener('mousedown', startDrag);

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
        titleBar.querySelector('[aria-label="Close"]').addEventListener('click', () => {
            windowDiv.remove();
        });
        titleBar.querySelector('[aria-label="Minimize"]').addEventListener('click', () => {
            windowDiv.style.display = 'none'; // Свернуть окно
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


    let isDragging = false;
    let offsetX, offsetY;

    function startDrag(e) {
        isDragging = true;
        offsetX = e.clientX - this.offsetLeft;
        offsetY = e.clientY - this.offsetTop;
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }

    function drag(e) {
        if (!isDragging) return;
        this.style.left = (e.clientX - offsetX) + 'px';
        this.style.top = (e.clientY - offsetY) + 'px';
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }

});
