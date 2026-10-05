# Jev Playground

Jev를 Codex의 hooks에 연결하는 Auto Mode의 구현과 검증용 저장소.

- [설정·동작 확인](jev-auto/README.md)
- [훅과 Jev의 로그 확인 절차](jev-auto/README.md#5-훅과-jev-로그-확인하기-b)
- [설계](jev-auto/docs/DESIGN.md)
- [Gateway 연결 검증 보고서](jev-auto/docs/REPORT.md)
- [사양을 Jev에게 따져보게 하고 ADR을 남기는 스킬](.claude/skills/gril-jev/SKILL.md) ([ADR 보관 위치](docs/adr/README.md))
- [17개 시·도 맞히기 폼 (Python/uv)](jev-form/README.md) — Jev의 확률 분포를 그대로 보는 예제
- [글: Jev의 확률 분포를 그대로 보기](jev-form/blog/guessing-provinces-with-jev.md)
- [RGB를 0~255로 묻는 예제 (TypeScript/Bun)](jev-rgb/README.md) — 순서가 있는 양을 score로 받아 분포에서 색을 조립한다 (실제 Jev의 score 10단계 제한으로 현재는 스텁 전용)
- [글: Jev에게 RGB를 0~255로 묻기](jev-rgb/blog/asking-jev-for-rgb.md)

로그는 실행 시 `audit:`에 표시된 디렉터리에서 확인한다. 저장 위치는 실행할 때마다 바뀌므로 shadow에서 auto로 전환할 때도 다시 선택한다.
