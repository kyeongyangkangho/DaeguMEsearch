document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsBody = document.getElementById('resultsBody');
    const noResults = document.getElementById('noResults');

    // 사용자가 제공한 '웹에 게시' URL
        // CORS 문제를 우회하기 위해 프록시 서버를 사용합니다.
    const SPREADSHEET_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://docs.google.com/spreadsheets/d/e/2PACX-1vRNr0RnGh79jDD-rrZUMpG-PRrJ4fTDqMxQe_L2DT9Gxnhhastnek5ZSbyqevfyg7804W4tgqZe395W/pub?gid=908772313&single=true&output=csv')}`;

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            alert('검색할 이름을 입력해주세요.');
            return;
        }

        console.log(`검색어: "${query}"`);

        try {
            const response = await fetch(SPREADSHEET_URL);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const csvText = await response.text();
            console.log("CSV 데이터 로드 성공.");
            const rows = parseCSV(csvText);
            console.log(`총 ${rows.length}개의 행이 파싱되었습니다.`);

            displayResults(rows, query);

        } catch (error) {
            console.error('데이터 로딩 또는 파싱 오류:', error);
            alert('데이터를 가져오는 중 오류가 발생했습니다. 스프레드시트가 웹에 올바르게 게시되었는지, 인터넷 연결이 정상인지 확인하세요.');
        }
    }

    function parseCSV(text) {
        // CSV의 각 줄을 분리하되, 마지막 빈 줄은 제거합니다.
        const lines = text.trim().split('\n');
        return lines.map(line => 
            // 각 줄을 쉼표로 분리하여 셀 데이터 배열을 만듭니다.
            line.split(',').map(cell => 
                // 셀의 앞뒤 공백과 따옴표를 제거합니다.
                cell.trim().replace(/^"|"$/g, '').trim()
            )
        );
    }

    function displayResults(rows, query) {
        resultsBody.innerHTML = '';
        resultsContainer.style.display = 'none';
        noResults.style.display = 'none';
        let found = false;
        const lowerCaseQuery = query.toLowerCase(); // 검색어를 소문자로 변경

        if (rows.length > 1) { // 헤더를 제외한 데이터가 있는지 확인
            // 첫 번째 행(헤더)은 건너뛰고 검색 (i=1부터 시작)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                
                // 행의 데이터가 충분하지 않으면 건너뜁니다.
                if (row.length < 7) continue; 

                const priest = (row[3] || '').toLowerCase();        // D열: 발표 사제
                const blessedCouple = (row[4] || '').toLowerCase(); // E열: 성사 부부
                const socialCouple = (row[5] || '').toLowerCase();  // F열: 사회 부부
                const ownCouple = (row[6] || '').toLowerCase();      // G열: 자신 부부

                if (
                    priest.includes(lowerCaseQuery) ||
                    blessedCouple.includes(lowerCaseQuery) ||
                    socialCouple.includes(lowerCaseQuery) ||
                    ownCouple.includes(lowerCaseQuery)
                ) {
                    found = true;
                    const newRow = resultsBody.insertRow();
                    // 원본 데이터로 테이블 셀을 채웁니다.
                    newRow.innerHTML = `
                        <td>${row[1] || ''}</td>
                        <td>${row[2] || ''}</td>
                        <td>${row[3] || ''}</td>
                        <td>${row[4] || ''}</td>
                        <td>${row[5] || ''}</td>
                        <td>${row[6] || ''}</td>
                    `;
                }
            }
        }

        if (found) {
            resultsContainer.style.display = 'block';
            console.log("검색 결과를 찾았습니다.");
        } else {
            noResults.style.display = 'block';
            console.log("일치하는 검색 결과가 없습니다.");
        }
    }
});