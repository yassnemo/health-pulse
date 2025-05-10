#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Demo Mode Starter for HealthPulse Analytics

This script starts a simulation of patient data with accelerated time
to demonstrate the full functionality of the HealthPulse Analytics platform.
"""

import os
import time
import logging
import argparse
import datetime
from generator import PatientDataGenerator
from kafka import KafkaAdminClient
from kafka.admin import NewTopic
from kafka.errors import TopicAlreadyExistsError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
TOPICS = [
    'patient-data',
    'patient-vitals',
    'patient-labs',
    'patient-medications'
]

def create_topics():
    """Create Kafka topics if they don't exist."""
    try:
        admin_client = KafkaAdminClient(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
        
        # Check existing topics
        existing_topics = []
        try:
            existing_topics = admin_client.list_topics()
            logger.info(f"Existing topics: {existing_topics}")
        except Exception as e:
            logger.error(f"Error listing topics: {str(e)}")
        
        # Create missing topics
        new_topics = []
        for topic in TOPICS:
            if topic not in existing_topics:
                new_topics.append(NewTopic(
                    name=topic,
                    num_partitions=1,
                    replication_factor=1
                ))
        
        if new_topics:
            admin_client.create_topics(new_topics)
            logger.info(f"Created topics: {[t.name for t in new_topics]}")
        else:
            logger.info("All required topics already exist")
            
    except TopicAlreadyExistsError:
        logger.info("Topics already exist")
    except Exception as e:
        logger.error(f"Error creating topics: {str(e)}")
    finally:
        if 'admin_client' in locals():
            admin_client.close()

def run_demo(num_patients, time_acceleration, duration_minutes):
    """
    Run the demo with accelerated time simulation.
    
    Args:
        num_patients: Number of patients to simulate
        time_acceleration: Factor by which to accelerate time
        duration_minutes: Real-world minutes to run the simulation
    """
    logger.info(f"Starting demo with {num_patients} patients, "
                f"{time_acceleration}x time acceleration, "
                f"for {duration_minutes} minutes")
    
    # Create topics
    create_topics()
    
    # Override environment variables for the generator
    os.environ['NUM_PATIENTS'] = str(num_patients)
    os.environ['DATA_INTERVAL_SECONDS'] = str(5 // time_acceleration)
    
    # Initialize data generator
    generator = PatientDataGenerator()
    
    # Calculate steps based on duration and acceleration
    total_steps = int(duration_minutes * 60 / (5 // time_acceleration))
    
    logger.info(f"Demo will run for {total_steps} simulation steps")
    logger.info(f"Starting time: {datetime.datetime.now()}")
    logger.info(f"Each step represents {5 // time_acceleration} seconds of real time")
    logger.info(f"Each step advances simulation by {5} seconds")
    
    try:
        # Run for specified duration
        for step in range(total_steps):
            generator.step_simulation()
            
            # Print progress every 10 steps
            if step % 10 == 0:
                progress = step / total_steps * 100
                sim_time = generator.current_time.strftime("%Y-%m-%d %H:%M:%S")
                logger.info(f"Progress: {progress:.1f}% | Simulation time: {sim_time}")
            
            time.sleep(5 // time_acceleration)
            
        logger.info("Demo completed successfully")
        
    except KeyboardInterrupt:
        logger.info("Demo stopped by user")
    except Exception as e:
        logger.error(f"Error in demo: {str(e)}", exc_info=True)

def main():
    """Main function to parse arguments and start the demo."""
    parser = argparse.ArgumentParser(description='HealthPulse Analytics Demo Mode')
    parser.add_argument('--patients', type=int, default=50,
                        help='Number of patients to simulate (default: 50)')
    parser.add_argument('--acceleration', type=int, default=10,
                        help='Time acceleration factor (default: 10x)')
    parser.add_argument('--duration', type=int, default=30,
                        help='Demo duration in minutes (default: 30)')
    
    args = parser.parse_args()
    
    run_demo(args.patients, args.acceleration, args.duration)

if __name__ == "__main__":
    main()
