// Menyiapkan elemen-elemen dari HTML
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const uploadInput = document.getElementById('upload-foto');
const downloadBtn = document.getElementById('download-btn');
const zoomSlider = document.getElementById('zoom-slider');

// Ukuran canvas
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

// Membuat objek gambar untuk bingkai (frame)
const frameImage = new Image();
frameImage.src = 'frame.svg';

// State (status) untuk gambar pengguna
let userImage = null;
let imageState = {
    x: 0,
    y: 0,
    scale: 1,
};

// State untuk dragging (memindahkan gambar)
let isDragging = false;
let startDrag = { x: 0, y: 0 };

// Fungsi utama untuk menggambar ulang seluruh canvas
function draw() {
    // 1. Bersihkan seluruh canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Gambar foto pengguna (jika sudah ada) dengan posisi dan skala yang disesuaikan
    if (userImage) {
        // Menghitung dimensi gambar setelah di-zoom
        const scaledWidth = userImage.width * imageState.scale;
        const scaledHeight = userImage.height * imageState.scale;

        // Gambar foto pengguna dengan state (posisi x, y dan skala) yang sudah disimpan
        ctx.drawImage(userImage, imageState.x, imageState.y, scaledWidth, scaledHeight);
    }
    
    // 3. Gambar bingkai di lapisan paling atas
    ctx.drawImage(frameImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Saat bingkai selesai dimuat, langsung gambar ke canvas
frameImage.onload = draw;

// Event listener saat pengguna memilih file foto
uploadInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            userImage = new Image();
            userImage.src = event.target.result;
            userImage.onload = () => {
                // Reset posisi dan zoom saat gambar baru diupload
                imageState = {
                    // Posisi awal di tengah canvas
                    x: (CANVAS_WIDTH - userImage.width) / 2,
                    y: (CANVAS_HEIGHT - userImage.height) / 2,
                    scale: 1,
                };
                zoomSlider.value = 1; // Reset slider
                
                draw(); // Gambar ulang canvas dengan foto baru
                downloadBtn.classList.remove('hidden'); // Tampilkan tombol download
            };
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

// Event listener untuk kontrol zoom
zoomSlider.addEventListener('input', (e) => {
    if (!userImage) return; // Jangan lakukan apa-apa jika belum ada foto

    imageState.scale = parseFloat(e.target.value);
    draw(); // Gambar ulang dengan skala baru
});

// --- Logika untuk Memindahkan Gambar (Drag and Drop) ---

// Saat tombol mouse DITEKAN di atas canvas
canvas.addEventListener('mousedown', (e) => {
    if (!userImage) return;
    isDragging = true;
    // Simpan posisi awal mouse dan posisi awal gambar
    startDrag.x = e.clientX - canvas.offsetLeft;
    startDrag.y = e.clientY - canvas.offsetTop;
});

// Saat mouse DIGERAKKAN di atas canvas (sambil menekan)
canvas.addEventListener('mousemove', (e) => {
    if (isDragging && userImage) {
        const mouseX = e.clientX - canvas.offsetLeft;
        const mouseY = e.clientY - canvas.offsetTop;
        
        // Hitung seberapa jauh mouse bergeser dari posisi awal
        const dx = mouseX - startDrag.x;
        const dy = mouseY - startDrag.y;
        
        // Perbarui posisi gambar berdasarkan pergeseran mouse
        imageState.x += dx;
        imageState.y += dy;

        // Simpan kembali posisi mouse saat ini untuk perhitungan selanjutnya
        startDrag.x = mouseX;
        startDrag.y = mouseY;
        
        draw(); // Gambar ulang canvas di posisi baru
    }
});

// Saat tombol mouse DILEPAS
canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// Saat mouse KELUAR dari area canvas
canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

// Event listener untuk tombol download
downloadBtn.addEventListener('click', () => {
    // Pastikan gambar sudah digambar dengan sempurna sebelum download
    draw(); 
    const dataURL = canvas.toDataURL('image/png');
    downloadBtn.href = dataURL;
    downloadBtn.download = 'twibbon-mpls-2025-custom.png';
});
