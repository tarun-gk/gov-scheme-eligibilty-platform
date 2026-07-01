-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: scheme_platform
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `schemes`
--

DROP TABLE IF EXISTS `schemes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schemes` (
  `scheme_id` int NOT NULL,
  `scheme_name` varchar(255) NOT NULL,
  `state` enum('Central','Telangana') NOT NULL,
  `category` varchar(100) NOT NULL,
  `eligibility` text NOT NULL,
  `benefits` text NOT NULL,
  `documents` text,
  `apply_link` text,
  `min_age` int DEFAULT NULL,
  `max_age` int DEFAULT NULL,
  `income_max` int DEFAULT NULL,
  `gender_allowed` enum('Any','Male','Female','Other') NOT NULL DEFAULT 'Any',
  `rules_verified` tinyint(1) NOT NULL DEFAULT '0',
  `rule_source` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`scheme_id`),
  KEY `idx_schemes_state` (`state`),
  KEY `idx_schemes_category` (`category`),
  KEY `idx_schemes_verified` (`rules_verified`),
  KEY `idx_schemes_gender` (`gender_allowed`),
  KEY `idx_schemes_age` (`min_age`,`max_age`),
  KEY `idx_schemes_income` (`income_max`),
  CONSTRAINT `chk_age_range` CHECK (((`min_age` is null) or (`max_age` is null) or (`min_age` <= `max_age`))),
  CONSTRAINT `chk_income_max` CHECK (((`income_max` is null) or (`income_max` >= 0))),
  CONSTRAINT `chk_max_age` CHECK (((`max_age` is null) or (`max_age` between 0 and 120))),
  CONSTRAINT `chk_min_age` CHECK (((`min_age` is null) or (`min_age` between 0 and 120)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schemes`
--

LOCK TABLES `schemes` WRITE;
/*!40000 ALTER TABLE `schemes` DISABLE KEYS */;
INSERT INTO `schemes` VALUES (1,'Pradhan Mantri Shram Yogi Maandhan Scheme','Central','Social Security','Unorganised workers age 18â€“40 with monthly income â‰¤ â‚¹15,000','Pension of â‚¹3,000/month after 60','Aadhaar, bank, NPS details','https://pib.gov.in/PressReleasePage.aspx?PRID=2108082',18,40,180000,'Any',1,'PIB: Age 18-40; monthly income <= Rs15,000 (stored as annual 180000)'),(2,'PM Kisan Samman Nidhi (PMKISAN)','Central','Agriculture','Landholding farmers families','Direct benefit transfer â‚¹6,000/year','Aadhaar, land papers, bank','https://www.myscheme.gov.in/schemes/pm-kisan',NULL,NULL,NULL,'Any',0,'Eligibility depends on landholding list'),(3,'Pradhan Mantri Awas Yojana - Urban','Central','Housing','EWS/LIG/MIG eligible families with income limits','Interest subsidy on housing loan','Aadhaar, income proof, property docs','https://pmaymis.gov.in',NULL,NULL,600000,'Any',0,'Income limits vary by category; stored as placeholder'),(4,'Pradhan Mantri Kaushal Vikas Yojana','Central','Skill Development','Age 18+','Skill training & certification','Aadhaar, educational proof','https://www.pmkvyofficial.org',18,NULL,NULL,'Any',1,'Eligibility text: Age 18+'),(5,'Stand Up India Scheme','Central','Entrepreneurship','SC/ST/Women entrepreneurs','Collateral-free loans','Aadhaar, business plan','https://www.standupmitra.in',NULL,NULL,NULL,'Any',0,'Group based eligibility'),(6,'Ayushman Bharat - PMJAY','Central','Health','Families in SECC list','Health cover â‚¹5 lakh per family','Aadhaar, SECC data','https://pmjay.gov.in',NULL,NULL,NULL,'Any',0,'Socio-economic criteria'),(7,'National Food Security Act','Central','Social Welfare','Eligible ration card holders','Subsidised food grains','Ration card, Aadhaar','https://nfsa.gov.in',NULL,NULL,NULL,'Any',0,'State/central criteria list'),(8,'Swachh Bharat Mission','Central','Sanitation','All households','Sanitation infrastructure support','Address proof','https://swachhbharatmission.gov.in',NULL,NULL,NULL,'Any',0,'Universal scheme'),(9,'Pradhan Mantri Ujjwala Yojana','Central','Energy','BPL households','Free LPG connection','Ration card, Aadhaar','https://www.pmuy.gov.in',NULL,NULL,NULL,'Any',0,'BPL based; numeric rules not included'),(10,'Beti Bachao Beti Padhao','Central','Women & Education','Girl child support','Awareness & support','Birth certificate','https://wcd.nic.in',NULL,NULL,NULL,'Female',0,'Gender implied; no numeric age limits'),(11,'Telangana Mahalakshmi Financial Assistance','Telangana','Social Welfare','Women heads of households with annual income â‰¤ 2 lakh','Financial support to women','Aadhaar, income proof, address','https://cleartax.in/s/mahalakshmi-scheme-telangana',18,NULL,200000,'Female',1,'Women + income <= 2 lakh'),(12,'Telangana Economic Rehabilitation Scheme','Telangana','Social Welfare','Age 21â€“55, annual income â‰¤1.5 lakh (rural) / â‰¤2 lakh (urban)','Financial assistance','Aadhaar, income proof','https://wdsc.telangana.gov.in/EconomicRehabilitationScheem.html',21,55,200000,'Any',1,'Official Telangana guidelines'),(13,'Kalyana Lakshmi - Shaadi Mubarak','Telangana','Social Welfare','Bride age â‰¥ 18, annual income â‰¤ 2 lakh','Marriage support','Aadhaar, wedding details','https://en.wikipedia.org/wiki/Kalyana_Lakshmi_-_Shaadi_Mubarak',18,NULL,200000,'Female',1,'Age and income constraints'),(14,'Telangana Rythu Bandhu','Telangana','Agriculture','Telangana farmers','Investment support','Land papers, Aadhaar','https://rythubandhu.telangana.gov.in',NULL,NULL,NULL,'Any',0,'Farmer status based'),(15,'Telangana Free Cattle Distribution','Telangana','Agriculture','Eligible farmers','Free cattle distribution','Land records','https://telangana.gov.in',NULL,NULL,NULL,'Any',0,'Specific rules not numeric'),(16,'TS Residential Schools Scholarship','Telangana','Education','Students in residential schools','Scholarship support','School certificate','https://telangana.gov.in',NULL,NULL,NULL,'Any',0,'Student based'),(17,'Telangana Yuva Nestham','Telangana','Youth Welfare','Unemployed youth','Monthly support','ID proof','https://telangana.gov.in',NULL,NULL,NULL,'Any',0,'Youth category only'),(18,'Telangana Gruha Lakshmi','Telangana','Women Empowerment','Women heads of households','Financial support','Aadhaar, ration card','https://telangana.gov.in',NULL,NULL,NULL,'Female',0,'Gender specific; no numeric age'),(19,'Telangana KCR Kit Scheme','Telangana','Health','Pregnant women','Maternal support kits','Pregnancy records','https://telangana.gov.in',NULL,NULL,NULL,'Female',0,'Pregnant women'),(20,'Telangana Pension Scheme','Telangana','Social Welfare','Senior citizens / disabled persons','Monthly pension','Disability certificate / age proof','https://telangana.gov.in',NULL,NULL,NULL,'Any',0,'Senior citizen implied; numeric not defined');
/*!40000 ALTER TABLE `schemes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-16 15:38:16
