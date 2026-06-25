/* =========================================================================
   OTP Space — общие данные
   Используется обеими страницами: index.html (X-проект) и goal.html (цель).
   ========================================================================= */

/* ───── Со-владельцы проекта (правая панель X-проекта) ───── */
window.COOWNERS = [
  { ini: 'СС', name: 'Симоненко Сергей',      dept: 'Core IT' },
  { ini: 'МН', name: 'Мельниченко Николай',   dept: 'Retail' },
  { ini: 'КВ', name: 'Коростелев Валерий',    dept: 'Corporate' },
  { ini: 'КЕ', name: 'Кобленц Екатерина',     dept: 'Marketing' },
  { ini: 'УВ', name: 'Украинский Виталий',    dept: 'Risks' },
  { ini: 'ЗС', name: 'Зиборов Сергей',        dept: 'Security' },
  { ini: 'АП', name: 'Алексеев Павел',        dept: 'Finance' },
  { ini: 'ПК', name: 'Плаксина Ксения',       dept: 'OPS' },
  { ini: 'МД', name: 'Маркосьянц Дмитрий',    dept: 'AI & Process' },
  { ini: 'ОЮ', name: 'Орешкина Юлия',         dept: 'Legal' },
  { ini: 'ГИ', name: 'Голубева Ирина',        dept: 'Internal audit' },
  { ini: 'НА', name: 'Носов Алексей',         dept: 'HR Ops' },
  { ini: 'ВТ', name: 'Власова Татьяна',       dept: 'L&D' },
];


/* ───── Цели проекта, сгруппированные по кварталам ─────
   Используется в таблице на index.html.
   Уровни: 0 — корень, 1 — дочерняя, 2 — внучка.
   factClass: 'ok' | 'late' | 'empty'
*/
window.QUARTERS = [
  {
    id: 'q1', label: 'Q1 2026', status: 'Завершено',
    sc: 'var(--green-50)', st: 'var(--green-700)',
    rows: [
      {
        id: 'g1', level: 0, type: 'ind',
        name: 'Сократить время адаптации с 90 до 45 рабочих дней',
        goalWeight: '20%',
        owners: [
          'Рощина Наталья | HR',
          'Симоненко Сергей | IT',
          'Мельниченко Николай | Retail',
          'Коростелев Валерий | Corporate',
          'Кобленц Екатерина | Marketing',
          'Украинский Виталий | Risks',
          'Зиборов Сергей | Security',
          'Алексеев Павел | Finance',
          'Плаксина Ксения | OPS',
          'Маркосьянц Дмитрий | AI',
          'Орешкина Юлия | Legal',
          'Голубева Ирина | Audit',
          'Носов Алексей | HR Ops',
        ],
        weights: ['20%','15%','10%','10%','8%','8%','7%','7%','5%','5%','5%','5%','5%'],
        plan: '45 дней', fact: '46 дней', factClass: 'late',
        hasChildren: true, open: false,
        children: [
          {
            id: 'g1c1', level: 1, type: 'ind',
            name: 'Программа «Наставник за час»',
            owners: ['Рощина Наталья | HR'], weights: ['10%'],
            plan: '100%', fact: '100%', factClass: 'ok',
            hasChildren: true, open: false,
            children: [
              {
                id: 'g1c1c1', level: 2, type: 'ind',
                name: 'Обучение ассистента новой программе',
                owners: ['Симоненко Сергей | IT'], weights: ['30%'],
                plan: '100%', fact: '✓', factClass: 'ok',
                hasChildren: false, children: [],
              },
            ],
          },
          {
            id: 'g1c2', level: 1, type: 'ind',
            name: 'Виртуальный AI-ассистент',
            owners: ['Симоненко Сергей | IT'], weights: ['20%'],
            plan: '100%', fact: '—', factClass: 'empty',
            hasChildren: false, children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'q2', label: 'Q2 2026', status: 'Оценка',
    sc: 'var(--orange-50)', st: 'var(--orange-700)',
    rows: [
      {
        id: 'g2', level: 0, type: 'ind',
        name: 'Сократить время адаптации с 45 до 25 рабочих дней',
        goalWeight: '20%',
        owners: ['Рощина Наталья | HR', 'Симоненко Сергей | IT'],
        weights: ['20%', '15%'],
        plan: '25 дней', fact: '20 дней', factClass: 'ok',
        hasChildren: true, open: false,
        children: [
          {
            id: 'g2c1', level: 1, type: 'ind',
            name: 'Наставник за час',
            owners: ['Пигерева Карина | HR'], weights: ['25%'],
            plan: '100%', fact: '100%', factClass: 'ok',
            hasChildren: false, children: [],
          },
          {
            id: 'g2c2', level: 1, type: 'ind',
            name: 'Создание виртуального AI-ассистента',
            owners: ['Балев Александр | IT'], weights: ['20%'],
            plan: '100%', fact: '—', factClass: 'empty',
            hasChildren: false, children: [],
          },
        ],
      },
      {
        id: 'g3', level: 0, type: 'cmd', tags: ['x'],
        name: 'Переход на новую систему аналитики',
        goalWeight: '15%',
        owners: ['HR Tech | HR', 'CoreIT | IT'], weights: ['10%', '10%'],
        plan: '100%', fact: '—', factClass: 'empty',
        hasChildren: true, open: false,
        children: [
          {
            id: 'g3c1', level: 1, type: 'cmd',
            name: 'Подготовка инфраструктуры',
            owners: ['Команда 1'], weights: ['20%'],
            plan: '100%', fact: '50%', factClass: 'ok',
            hasChildren: true, open: false,
            children: [
              {
                id: 'g3c1c1', level: 2, type: 'cmd',
                name: 'Разработка движка',
                owners: ['Команда 2'], weights: ['30%'],
                plan: '100%', fact: '—', factClass: 'empty',
                hasChildren: false, children: [],
              },
              {
                id: 'g3c1c2', level: 2, type: 'cmd',
                name: 'Разработка интерфейса',
                owners: ['Команда 3'], weights: ['25%'],
                plan: '100%', fact: '—', factClass: 'empty',
                hasChildren: false, children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'q3', label: 'Q3 2026', status: 'Планирование',
    sc: 'var(--blue-50)', st: 'var(--blue-700)',
    rows: [
      {
        id: 'g4', level: 0, type: 'ind',
        name: 'Сократить время адаптации с 25 до 7 рабочих дней',
        goalWeight: '20%',
        owners: ['Рощина Наталья | HR', 'Симоненко Сергей | IT'],
        weights: ['20%', '20%'],
        plan: '7 дней', fact: '', factClass: 'empty',
        hasChildren: false, children: [],
      },
    ],
  },
];


/* ───── Полное дерево целей (страница goal.html) ─────
   Узлы вложены через children. type: 'project' | 'x' | 'ind' | 'cmd'.
   dod: массив строк, '' = пустая строка-разделитель.
*/
window.TREE = {
  id: 'proj', type: 'project',
  name: 'Адаптация новичка за 7 дней',
  children: [
    {
      id: 'xgoal', type: 'x',
      name: 'Сократить время адаптации с 90 до 7 дней',
      weight: '—', pct: 68, owner: 'Рощина Н.', dept: 'HR', quarter: 'Q1–Q3 2026',
      children: [
        {
          id: 'g1', type: 'ind',
          name: 'Сократить время адаптации с 90 до 45 рабочих дней',
          weight: '20%', pct: 100, owner: 'Рощина Н.', dept: 'HR', quarter: 'Q1 2026',
          weightNum: '20', goalType: 'Количественная', isReverse: false,
          strategicPriority: 'Не влияю на стратегический приоритет',
          period: 'Q1, 2026',
          planVal: '45', planUnit: 'дн', factVal: '46', factUnit: 'дн',
          comment: 'Незначительное превышение срока из-за праздников.',
          dos: [
            'Новичок выходит на 45-дневный онбординг.',
            'Процесс адаптации задокументирован и передан в HR.',
          ],
          dod: [
            'Подготовлена программа наставничества.',
            'Настроен AI-ассистент.',
            'Проведён пилот с двумя командами.',
          ],
          children: [
            {
              id: 'g1c1', type: 'ind',
              name: 'Программа «Наставник за час»',
              weight: '10%', pct: 100, owner: 'Рощина Н.', dept: 'HR', quarter: 'Q1 2026',
              weightNum: '10', goalType: 'Количественная', isReverse: false,
              strategicPriority: 'Не влияю на стратегический приоритет',
              period: 'Q1, 2026',
              planVal: '100', planUnit: '%', factVal: '100', factUnit: '%',
              comment: 'Программа запущена в срок.',
              dos: [
                'Описана программа адаптации с привязкой к срокам.',
                'Практические инструменты и фреймворки готовы к использованию.',
              ],
              dod: [
                'Этап 1. Подготовка до встречи',
                '1. Участник формулирует один главный запрос.',
                '2. Готовит краткий контекст (2–3 предложения).',
                '3. Отправляет материалы наставнику за 24 часа.',
                '',
                'Этап 2. Снятие запроса',
                '• Участник озвучивает запрос и ожидания.',
                '• Наставник и участник согласовывают реалистичную цель.',
                '',
                'Этап 3. Фиксация и договорённости',
                '• Составление письменного перечня шагов с дедлайнами.',
                '• Согласование контрольной точки (чек-ин через 1–2 недели).',
              ],
              children: [
                {
                  id: 'g1c1c1', type: 'cmd',
                  name: 'Обучение ассистента новой программе',
                  weight: '30%', pct: 100, owner: 'Симоненко С.', dept: 'IT', quarter: 'Q1 2026',
                  weightNum: '30', goalType: 'Количественная', isReverse: false,
                  strategicPriority: 'Не влияю на стратегический приоритет',
                  period: 'Q1, 2026',
                  planVal: '100', planUnit: '%', factVal: '100', factUnit: '%',
                  comment: 'Выполнено.',
                  dos: ['Ассистент обучен на новой программе адаптации.'],
                  dod: ['Загружена база знаний.', 'Проведено тестирование.', 'Получена обратная связь от HR.'],
                  children: [],
                },
              ],
            },
            {
              id: 'g1c2', type: 'ind',
              name: 'Виртуальный AI-ассистент',
              weight: '20%', pct: 60, owner: 'Симоненко С.', dept: 'IT', quarter: 'Q1 2026',
              weightNum: '20', goalType: 'Количественная', isReverse: false,
              strategicPriority: 'Не влияю на стратегический приоритет',
              period: 'Q1, 2026',
              planVal: '100', planUnit: '%', factVal: '—', factUnit: 'шт.',
              comment: 'Комментарий не внесён.',
              dos: ['Виртуальный AI-ассистент отвечает на вопросы новичков 24/7.'],
              dod: ['Интегрирован с HR-системой.', 'Обучен на FAQ.', 'Протестирован на 10 сотрудниках.'],
              children: [
                {
                  id: 'g1c2c1', type: 'cmd',
                  name: 'Разработка движка AI',
                  weight: '30%', pct: 60, owner: 'Команда 2', dept: 'IT', quarter: 'Q1 2026',
                  weightNum: '30', goalType: 'Количественная', isReverse: false,
                  strategicPriority: 'Не влияю на стратегический приоритет',
                  period: 'Q1, 2026',
                  planVal: '100', planUnit: '%', factVal: '60', factUnit: '%',
                  comment: 'В процессе.',
                  dos: ['Разработан и задеплоен движок обработки запросов.'],
                  dod: ['Написан бэкенд.', 'Настроен API.', 'Пройдено нагрузочное тестирование.'],
                  children: [],
                },
                {
                  id: 'g1c2c2', type: 'cmd',
                  name: 'Разработка интерфейса',
                  weight: '25%', pct: 40, owner: 'Команда 3', dept: 'IT', quarter: 'Q1 2026',
                  weightNum: '25', goalType: 'Количественная', isReverse: false,
                  strategicPriority: 'Не влияю на стратегический приоритет',
                  period: 'Q1, 2026',
                  planVal: '100', planUnit: '%', factVal: '40', factUnit: '%',
                  comment: 'Дизайн согласован.',
                  dos: ['Чат-интерфейс внедрён в портал новичка.'],
                  dod: ['Макеты готовы.', 'Разработан front-end.', 'Проведено UX-тестирование.'],
                  children: [],
                },
              ],
            },
          ],
        },
        {
          id: 'g2', type: 'ind',
          name: 'Сократить время адаптации с 45 до 25 рабочих дней',
          weight: '20%', pct: 75, owner: 'Рощина Н.', dept: 'HR', quarter: 'Q2 2026',
          weightNum: '20', goalType: 'Количественная', isReverse: false,
          strategicPriority: 'Не влияю на стратегический приоритет',
          period: 'Q2, 2026',
          planVal: '25', planUnit: 'дн', factVal: '20', factUnit: 'дн',
          comment: 'Идём с опережением.',
          dos: ['Онбординг укорочен до 25 рабочих дней.'],
          dod: ['AI-ассистент запущен.', 'Наставник за час внедрён.'],
          children: [],
        },
      ],
    },
  ],
};


/* ───── Утилита: инициалы из «Имя Фамилия» ───── */
window.initials = function (n) {
  var p = (n || '').trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : (n || '').slice(0, 2).toUpperCase();
};
