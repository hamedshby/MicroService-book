function toggleChapter(header) {
    const items = header.nextElementSibling;
    const isOpen = items.classList.contains('open');
    items.classList.toggle('open', !isOpen);
    header.classList.toggle('open', !isOpen);
}

function setActive(item) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function copyCode(btn) {
    const code = btn.closest('.code-block').querySelector('code').innerText;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '✓ کپی شد';
        setTimeout(() => btn.textContent = 'کپی', 2000);
    });
}

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.mobile-toggle');
    if (window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

document.querySelectorAll('.chapter-list a').forEach(link => {

    link.addEventListener('click', function (e) {

        e.preventDefault();

        showChapter(this.dataset.target);

    });

});

function chapterIdToSection(chapterId) {
    return chapterId.replace(/^ch/, "").replace(/-/g, ".");
}

function sectionToChapterId(section) {
    return "ch" + section.replace(/\./g, "-");
}

async function showChapter(chapterId, { updateUrl = true, historyMode = "push" } = {}) {

    const content = document.getElementById("content");

    try {

        const response = await fetch(`chapters/${chapterId}.html`);

        if (!response.ok) {
            throw new Error("Chapter not found");
        }

        const html = await response.text();

        content.innerHTML = html;

        localStorage.setItem("currentChapter", chapterId);

        if (updateUrl) {

            const section = chapterIdToSection(chapterId);
            const url = new URL(window.location.href);
            url.searchParams.set("s", section);

            if (historyMode === "replace") {
                history.replaceState({ chapter: chapterId }, "", url);
            } else {
                history.pushState({ chapter: chapterId }, "", url);
            }

        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
    catch (err) {

        content.innerHTML = `
            <h2>خطا</h2>
            <p>فایل ${chapterId}.html پیدا نشد.</p>
        `;

        console.error(err);

    }

}

// نمایش خودکار فصل اول هنگام باز شدن سایت
document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const sectionParam = params.get("s");

    const chapter = sectionParam
        ? sectionToChapterId(sectionParam)
        : (localStorage.getItem("currentChapter") || "ch1-1");

    showChapter(chapter, { historyMode: "replace" });

    const item = document.querySelector(`.chapter-list a[data-target="${chapter}"]`);

    if (item) {
        setActive(item);

        const list = item.closest(".chapter-items");
        if (list) {
            list.classList.add("open");

            const header = list.previousElementSibling;
            if (header) {
                header.classList.add("open");
            }
        }
    }

});

// همگام‌سازی محتوا هنگام استفاده از دکمه‌های Back/Forward مرورگر
window.addEventListener("popstate", () => {

    const params = new URLSearchParams(window.location.search);
    const sectionParam = params.get("s");
    const chapter = sectionParam ? sectionToChapterId(sectionParam) : "ch1-1";

    showChapter(chapter, { updateUrl: false });

});

function toggleSidebarDesktop() {

    const sidebar = document.getElementById("sidebar");
    const main = document.querySelector(".main");

    sidebar.classList.toggle("closed");
    main.classList.toggle("full");

}