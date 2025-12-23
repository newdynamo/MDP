# Co-Fleeter 트레이딩 기능 보완 및 개선 보고서

## 1. 개요
Co-Fleeter의 트레이딩 기능을 고도화하기 위해 EU-ETS 및 FuelEU Maritime 관련 타사 플랫폼(Hecla, Clarksons, OceanScore 등)을 벤치마킹하였습니다. 이를 바탕으로 현재 시스템의 부족한 점을 분석하고 구체적인 개선 방안을 제안합니다.

## 2. 시장 분석 (Benchmarking)
타사 플랫폼들은 단순한 매수/매도 기능을 넘어 **규제 준수(Compliance)**와 **수익화(Commercialization)**를 연계하는 방향으로 진화하고 있습니다.

| 주요 기능 | 설명 | 벤치마킹 사례 |
| :--- | :--- | :--- |
| **FuelEU Pooling** | 여러 선박을 그룹(Pool)으로 묶어 규제 페널티를 상쇄하거나 잉여분을 판매하는 마켓플레이스 제공. | OceanScore, BetterSea |
| **Compliance Dashboard** | 현재 배출량 및 연료 사용량을 기반으로 실시간 패널티/잉여금 계산 및 트레이딩 필요 수량 자동 제시. | Veson, StormGeo |
| **Banking & Borrowing** | 잉여분을 내년으로 이월(Banking)하거나, 내년분을 미리 당겨쓰는(Borrowing) 전략적 관리 기능. | DNV, Hecla |
| **Advanced Charting** | 단순 가격 추이뿐만 아니라 호가 심도(Depth Chart), 캔들 차트, 규제 가격 예측 지표(Compliance Market Indicator) 제공. | Hecla |

## 3. Co-Fleeter 현황 및 갭 분석 (Gap Analysis)
현재 Co-Fleeter의 트레이딩 시스템은 기본적인 호가창(Order Book)과 매칭 기능만 보유하고 있습니다.

1.  **FuelEU Pooling 부재**: 현재 FuelEU 트레이딩 탭(`renderTradingFuelEU`)이 존재하지만, 단순 매매 기능만 있어 **Pooling(풀링)** 파트너 찾기나 풀 결성 기능이 없습니다.
    *   *분석*: FuelEU Maritime의 핵심은 'Pooling'을 통한 페널티 회피입니다.
2.  **계산기-트레이딩 연동 부족**: 계산기에서 도출된 'Deficit(부족분)'이나 'Surplus(잉여분)' 데이터가 트레이딩 화면에 표시되지 않습니다. 사용자가 직접 수량을 기억해서 입력해야 합니다.
3.  **단조로운 UI**: 텍스트 기반의 호가창만 제공되며, 시장의 매수/매도 세기를 직관적으로 보여주는 **Depth Chart** 등이 없습니다.

## 4. 개선 제안 (Improvement Proposal)

### 4.1 FuelEU Pooling 마켓플레이스 구축
*   **신규 탭 추가**: 'Trading (FuelEU)' 내에 'Pooling Marketplace' 탭 신설.
*   **기능**:
    *   **Find Partner**: 나의 잉여/부족분을 게시하고, 상쇄 가능한 파트너(선박) 매칭 추천.
    *   **Pool Simulator**: 특정 선박과 풀을 결성했을 때의 예상 페널티 절감액 시뮬레이션.

### 4.2 규제 준수 연동 위젯 (Smart Compliance Widget)
*   **위치**: 트레이딩 화면 우측 사이드바.
*   **기능**: `dataService`의 최신 계산 결과를 불러와 **"현재 부족한 EUA: 5,000개"** 또는 **"FuelEU 페널티 예상: €20,000"** 등의 상태를 실시간 표시.
*   **Action**: 위젯에서 'Buy All Shortage' 버튼 클릭 시, 부족분만큼 매수 주문창 자동 입력.

### 4.3 시각화 고도화 (Visual Upgrade)
*   **Depth Chart**: 매수/매도 잔량을 누적 그래프로 시각화하여 시장 유동성 파악 지원.
*   **Price Candle Chart**: 시가/고가/저가/종가를 보여주는 전문적인 차트 도입 (현재는 단순 라인 차트).

### 4.4 뱅킹/보로잉(Banking/Borrowing) 관리
*   **나의 자산(My Wallet)** 섹션에 EUA 보유량뿐만 아니라, FuelEU 뱅킹(이월된 잉여분) 현황을 보여주는 기능 추가.

---
**결론**: 단순 트레이딩을 넘어 **"규제 준수를 위한 원스톱 솔루션"**으로 발전하기 위해, **Pooling 기능**과 **Compliance 연동**을 최우선으로 도입할 것을 권장합니다.
