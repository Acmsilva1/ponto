// Gerenciamento de Tabs
        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.sidebar-item').forEach(btn => {
                btn.classList.remove('nav-active');
            });
            
            document.getElementById(tabId).classList.add('active');
            document.getElementById('btn-' + tabId).classList.add('nav-active');

            const titles = {
                'dashboard': 'Visão Geral',
                'registro': 'Registro de Ponto',
                'folha': 'Folha Mensal',
                'perfil': 'Meu Perfil'
            };
            document.getElementById('pageTitle').innerText = titles[tabId];

            if(tabId === 'dashboard') {
                setTimeout(initChart, 100);
            }
        }

        // Dark Mode Pro
        function toggleTheme() {
            const html = document.documentElement;
            const icon = document.getElementById('themeIcon');
            const text = document.getElementById('themeText');
            
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                icon.classList.replace('fa-sun', 'fa-moon');
                text.innerText = "Modo Escuro";
                localStorage.setItem('nexus-theme', 'light');
            } else {
                html.classList.add('dark');
                icon.classList.replace('fa-moon', 'fa-sun');
                text.innerText = "Modo Claro";
                localStorage.setItem('nexus-theme', 'dark');
            }
            setTimeout(initChart, 200);
        }

        // Relógio High-Tech
        function updateClock() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('pt-BR', { hour12: false });
            const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const clockEl = document.getElementById('liveClock');
            if(clockEl) clockEl.textContent = timeStr;
            
            const dateEl = document.getElementById('liveDate');
            if(dateEl) dateEl.textContent = dateStr;
            
            const headerDate = document.getElementById('headerDate');
            if(headerDate) headerDate.textContent = dateStr;
        }
        setInterval(updateClock, 1000);
        updateClock();

        // Feedback de Registro
        async function actionPonto(tipo) {
            const now = new Date().toLocaleTimeString('pt-BR');
            const actionMap = {
                'Entrada': 'clock_in',
                'Saída Almoço': 'break_start',
                'Retorno Almoço': 'break_end',
                'Saída': 'clock_out'
            };

            try {
                await window.NexusTimeApi.registerTimeEntry({
                    employeeId: window.NexusTimeApi.DEFAULT_EMPLOYEE_ID,
                    type: actionMap[tipo],
                    occurredAt: new Date().toISOString()
                });

                alert(`✅ Sucesso!\nRegistro de ${tipo} efetuado às ${now}.\nOs dados foram enviados para o servidor.`);
            } catch (error) {
                alert(`⚠️ Ops!\nNão foi possível registrar ${tipo}.\n${error.message}`);
            }
        }

        // ECharts Premium Config
        let myChart = null;
        function initChart() {
            const chartDom = document.getElementById('mainChart');
            if (!chartDom) return;
            
            if (myChart) myChart.dispose();
            const isDark = document.documentElement.classList.contains('dark');
            myChart = echarts.init(chartDom, isDark ? 'dark' : null);
            
            const option = {
                backgroundColor: 'transparent',
                tooltip: { 
                    trigger: 'axis',
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    textStyle: { color: isDark ? '#f1f5f9' : '#1e293b' }
                },
                grid: { left: '0%', right: '0%', bottom: '0%', top: '10%', containLabel: true },
                xAxis: {
                    type: 'category',
                    data: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { color: '#94a3b8', fontWeight: 'bold' }
                },
                yAxis: { 
                    type: 'value', 
                    splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9' } },
                    axisLabel: { color: '#94a3b8' }
                },
                series: [{
                    name: 'Horas',
                    type: 'bar',
                    barWidth: '30%',
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#3b82f6' },
                            { offset: 1, color: '#60a5fa' }
                        ]),
                        borderRadius: [10, 10, 0, 0]
                    },
                    data: [8, 9.5, 8.2, 7.8, 8.5, 0, 0],
                    emphasis: { itemStyle: { color: '#2563eb' } }
                }]
            };
            myChart.setOption(option);
        }

        // Init
        window.onload = () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('./sw.js').catch(() => {});
            }
            if (localStorage.getItem('nexus-theme') === 'light') {
                document.documentElement.classList.remove('dark');
                document.getElementById('themeIcon').classList.replace('fa-sun', 'fa-moon');
                document.getElementById('themeText').innerText = "Modo Escuro";
            }
            initChart();
            window.addEventListener('resize', () => myChart && myChart.resize());
        };
