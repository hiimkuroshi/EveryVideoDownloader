---
title: Testing
aliases:
  - Kiểm thử
  - Verification
tags:
  - project/everyvideo
  - testing
type: reference
status: active
created: 2026-09-09
updated: 2026-09-09
related:
  - "[[03 - Bilibili Download Flow]]"
  - "[[06 - Known Issues and Risks]]"
---

# Testing

## Baseline và verification ngày 2026-09-09

Lệnh:

```powershell
npm run test:contracts
```

Kết quả:

- UI contract: **pass** — 151 HTML ID duy nhất, 115 JavaScript hook hợp lệ.
- Server contract: **pass** — 11 GET route duy nhất, có guard cho process/API errors.
- `npm run test:unit`: **pass** — option builder kiểm tra Auto/Native/aria2, whitelist connections, URL ngoài Bilibili và missing executable.
- `node --check` cho `server.js`, `setup.js`, `public/script.js`, `public/i18n.js`: **pass**.
- `npm run test:python`: **pass 9/9** — wrapper tự chọn Python portable tại `.runtime/python/python.exe` và đặt `PYTHONPATH=core`.
- Smoke local `/api/config`: **pass** — capability trả `hasAria2c=true`, `hasLocalFfmpeg=true`, engine mặc định `auto`, connections mặc định `8`, UPOS default `mirrorcosov`; UI mặc định bật Anti-P2P và Geo Bypass.
- Smoke tải Bilibili thật trước đó: **pass** — format `100109`, engine explicit `aria2c`, 4 connections, file mẫu 15.74 MiB hoàn tất trong khoảng 1 giây, tốc độ hiển thị 12.11 MiB/s; không ghi signed URL vào log/vault.
- End-to-end URL `BV1opg36pEPf`: **pass** — sau khi thêm Bilibili-only `Referer`/User-Agent, analyze trả 15 formats; `auto + aria2 x8` tải `30080+30280`, video hiển thị 24.29 MiB/s, audio 8.02 MiB/s; FFprobe xác nhận 240.746667 giây, H.264 1920×822 và AAC stereo. Lượt `fastest` cùng format đạt 12.15 MiB/s và chọn host `upos-sz-mirrorcosov.bilivideo.com`.
- Native mirroraliov đối chứng không kết luận được vì upstream trả HTTP 412 sau nhiều lượt liên tiếp; không dùng lượt lỗi này làm baseline.
- Benchmark ma trận tự động: **21 option case**, 11 pass ở vòng đầu; lặp 7 ứng viên đầu bảng thêm 2 vòng. Nhóm ổn định 3/3: `mirrorcosov` median 28.35 MiB/s (nhanh nhất), Akamai median 26.65 MiB/s, aria2 x8 + auto median 25.19 MiB/s, aria2 x16 + auto median 24.86 MiB/s. Native đạt tối đa 0.316 MiB/s với chunk 100M nhưng chỉ có một lượt pass; các case HTTP 412 được ghi là upstream rate-limit.
- `ffmpeg`/`ffprobe`: **pass** — runtime portable 9.0.1 được nhận diện qua `/api/config`; synthetic MP4 smoke xác nhận duration 1 giây, H.264 video 320×180 và AAC audio. Chưa dùng kết quả này thay cho FFprobe trên file Bilibili benchmark.
- Chưa chạy ma trận benchmark 3 video × 3 lần; benchmark hiện tại chỉ trên một video nên default `mirrorcosov` là quyết định cục bộ/tạm thời, chưa phải kết luận tối ưu toàn mạng.

## Các tầng kiểm thử

| Tầng | Mục đích | Lệnh/trạng thái |
| --- | --- | --- |
| Static/contract | DOM hook, route trùng, error guard | `npm run test:contracts` |
| Unit | Hàm thuần như URL optimizer, arg builder, parser | `npm run test:unit`; `npm run test:python` (9/9) |
| Integration local | Server + Python core + FFmpeg + filesystem | `npm test`, có side effects |
| Network Bilibili | WBI, cookie, formats, CDN, download | Smoke và benchmark chuyên biệt một video đã chạy; gate đa video còn mở |
| End-to-end UI | Analyze → select → download → verify file | Chủ yếu thủ công |

## Ma trận Bilibili đề xuất

### URL type

- Video BV công khai, một phần.
- Anthology nhiều phần.
- Bangumi công khai và premium.
- Video cần đăng nhập/phụ đề cần đăng nhập.
- Live, audio hoặc playlist chỉ khi nằm trong scope phát hành.

### Auth

- Không cookie.
- Cookie browser hợp lệ.
- Cookie hết hạn/không đọc được.

### Format

- Preset `bv*+ba/b`.
- Exact video-only ID.
- Exact audio-only ID.
- Expression `videoID+audioID`.
- AVC, HEVC, AV1; 720p/1080p/4K nếu tài khoản cho phép.

### CDN

- Auto + anti-P2P bật.
- Alibaba overseas.
- Tencent overseas.
- Akamai.
- CDN gốc + anti-P2P tắt.

### Performance downloader

- Native HTTP: chunk off, 1M, 10M, 100M.
- aria2 direct HTTP(S): x4/s4/k4M, x8/s8/k2M, x16/s16/k1M.
- Đo cùng format, cùng mạng, ít nhất ba lần; signed URL phải được lấy mới cho từng lượt.
- Ghi rõ MiB/s, TTFB, HTTP status, Content-Range và host đã che query token.
- Chi tiết tiêu chí chọn mặc định tại [[09 - Bilibili Download Speed Research#5. Ma trận benchmark bắt buộc trước khi chọn mặc định]].

### Assertions

- Metadata và format count hợp lý.
- Host được chọn đúng theo cấu hình.
- HTTP status/TTFB/throughput nằm trong ngưỡng đã định.
- File hoàn tất, không còn `.part` ngoài ý muốn.
- FFprobe xác nhận duration, video stream, audio stream và codec.
- Cancel dừng process và không rò task.

## Ưu tiên bổ sung test

1. Mở rộng Python unit test `_is_p2p_host`, candidate/probe và thêm assertion chọn host nhanh nhất.
2. Mock lifecycle `/api/download` để chứng minh ENOENT/external downloader failure/cancel chỉ tạo tối đa hai attempt.
3. UI behavior test cho quan hệ giữa `allow_p2p` và checkbox anti-P2P.
4. UI behavior test cho video-only selection + audio merge.
5. Integration Bilibili opt-in bằng biến môi trường; không chạy mặc định trong CI.
6. Sửa integration harness để backup/restore config, dùng thư mục tạm và tự tìm FFprobe portable/PATH.

## Cách ghi bằng chứng

Mỗi lần test Bilibili, ghi vào [[08 - Work Log]]:

- Ngày/giờ và loại mạng, không ghi IP cá nhân.
- Loại URL và auth state, không lưu cookie.
- Format expression, codec/resolution.
- Chế độ anti-P2P và UPOS.
- Kết quả analyze/download, tốc độ mẫu, lỗi đã rút gọn.
- File verification bằng FFprobe.
