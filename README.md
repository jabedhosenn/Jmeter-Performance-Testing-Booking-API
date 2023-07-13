# Jmeter-Performance-Testing-Booking-AP.

How to extract data for reporting in jmeter
============================================
Dear, 

I’ve completed performance test on frequently used API for test App. 
Test executed for the below mentioned scenario in server 000.000.000.00. 

10 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 10 And Total Concurrent API requested: 800.
50 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 66.67 And Total Concurrent API requested: 4000.
100 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 133.33 And Total Concurrent API requested: 8000.
500 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 544 And Total Concurrent API requested: 40000.
700 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 580 And Total Concurrent API requested: 56000.
1000 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 431 And Total Concurrent API requested: 80000.
1500 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 814 And Total Concurrent API requested: 120000.
2000 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 486 And Total Concurrent API requested: 160000.
2100 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 669 And Total Concurrent API requested: 168000.

While executed 2100 concurrent request, found  1548 request got connection timeout and error rate is 0.92%. 

Summary: Server can handle almost concurrent 164000 API call with almost zero (0) error rate.
